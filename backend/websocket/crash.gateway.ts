import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { CrashService, RoundState } from '../crash/crash.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:4001', 'http://localhost:3000', 'http://localhost:4000'],
    credentials: true,
  },
  namespace: '/crash',
})
export class CrashGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CrashGateway.name);
  private gameInterval: NodeJS.Timeout;
  private autoCashoutInterval: NodeJS.Timeout;

  constructor(
    private crashService: CrashService,
    private jwtService: JwtService,
  ) {
    this.logger.log('CrashGateway initialized');
    // Запускаем игровой цикл с небольшой задержкой
    setTimeout(() => {
      this.startGameLoop();
    }, 1000);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Send current state immediately
    const state = this.crashService.getRoundState();
    client.emit('round_state', state);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('place_bet')
  async handlePlaceBet(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      token: string;
      amount: number;
      type: 'balance' | 'item';
      autoCashout: number;
      itemId?: string;
    },
  ) {
    try {
      // Verify token
      const payload = this.jwtService.verify(data.token, {
        secret: process.env.JWT_SECRET || 'your-secret-key',
      });
      const userId = payload.sub;
      const username = payload.username;

      const result = await this.crashService.placeBet(
        userId,
        username,
        data.amount,
        data.type,
        data.autoCashout,
        data.itemId,
      );

      if (result.success) {
        client.emit('bet_placed', { 
          success: true,
          newBalance: result.newBalance,
        });
        
        // Broadcast updated state
        this.broadcastRoundState();
      } else {
        client.emit('bet_error', { error: result.error });
      }
    } catch (error) {
      this.logger.error(`Error placing bet: ${error.message}`);
      if (error.name === 'TokenExpiredError') {
        client.emit('bet_error', { error: 'Токен истек, войдите заново' });
      } else if (error.name === 'JsonWebTokenError') {
        client.emit('bet_error', { error: 'Неверный токен' });
      } else {
        client.emit('bet_error', { error: 'Ошибка при размещении ставки' });
      }
    }
  }

  @SubscribeMessage('cashout')
  async handleCashout(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { token: string },
  ) {
    try {
      const payload = this.jwtService.verify(data.token, {
        secret: process.env.JWT_SECRET || 'your-secret-key',
      });
      const userId = payload.sub;

      const result = await this.crashService.cashout(userId);

      if (result.success) {
        client.emit('cashout_success', {
          multiplier: result.multiplier,
          profit: result.profit,
          newBalance: result.newBalance,
        });
        
        // Broadcast updated state
        this.broadcastRoundState();
      } else {
        client.emit('cashout_error', { error: result.error });
      }
    } catch (error) {
      this.logger.error(`Error cashing out: ${error.message}`);
      if (error.name === 'TokenExpiredError') {
        client.emit('cashout_error', { error: 'Токен истек, войдите заново' });
      } else {
        client.emit('cashout_error', { error: 'Ошибка при выводе' });
      }
    }
  }

  private startGameLoop() {
    this.logger.log('Starting Crash game loop');

    const runGameCycle = async () => {
      try {
        const round = this.crashService.getCurrentRound();

        switch (round.state) {
          case RoundState.COUNTDOWN:
            // 10 секунд ожидания ставок (mascot_idle.webm)
            // Проверяем, нужно ли запускать countdown
            if (!round.countdownStartTime) {
              await this.crashService.startCountdown();
              this.server.emit('countdown_start', {
                startTimestamp: Date.now(),
                duration: 10000,
              });
              this.broadcastRoundState();
            }
            
            // Schedule transition to RUNNING
            setTimeout(async () => {
              await this.crashService.startRound();
              runGameCycle();
            }, 10000); // 10s countdown
            break;

          case RoundState.RUNNING:
            // Старт раунда (run_game.webm + fone.webm)
            this.server.emit('round_start', {
              startTimestamp: Date.now(),
              initialMultiplier: 1.00,
            });
            this.broadcastRoundState();
            
            // Start auto-cashout checker
            this.startAutoCashoutChecker();
            
            // Calculate crash time
            const crashMultiplier = round.crashMultiplier;
            const crashTime = Math.log(crashMultiplier) * 10000;
            
            setTimeout(async () => {
              await this.crashService.crashRound();
              runGameCycle();
            }, crashTime);
            break;

          case RoundState.CRASH:
            // Crash! (death.webm, фон останавливается)
            this.stopAutoCashoutChecker();
            this.server.emit('round_crash', {
              crashMultiplier: round.crashMultiplier,
              crashTimestamp: Date.now(),
            });
            this.broadcastRoundState();
            
            // Сразу переходим в POST_CRASH_WAIT
            setTimeout(async () => {
              await this.crashService.startPostCrashWait();
              this.server.emit('post_crash_wait', {
                startTimestamp: Date.now(),
                duration: 3000,
              });
              this.broadcastRoundState();
              setTimeout(() => runGameCycle(), 3000); // 3s pause
            }, 100);
            break;

          case RoundState.POST_CRASH_WAIT:
            // 3 секунды паузы (death.webm остаётся, фон статичен)
            // Переход в RESET
            await this.crashService.resetRound();
            this.server.emit('round_reset', {
              startTimestamp: Date.now(),
            });
            this.broadcastRoundState();
            
            setTimeout(() => runGameCycle(), 1000); // 1s recovery animation
            break;

          case RoundState.RESET:
            // Восстановление (back_posle death.webm)
            // Подготовка следующего раунда
            await this.crashService.prepareNextRound();
            const results = this.crashService.getRoundState();
            this.server.emit('round_end', {
              crashMultiplier: round.crashMultiplier,
              bets: results.bets,
              history: results.history,
            });
            this.broadcastRoundState();
            
            setTimeout(() => runGameCycle(), 100);
            break;
        }
      } catch (error) {
        this.logger.error(`Game loop error: ${error.message}`);
        setTimeout(() => runGameCycle(), 1000);
      }
    };

    runGameCycle();
  }

  private startAutoCashoutChecker() {
    this.autoCashoutInterval = setInterval(async () => {
      const autoCashouts = await this.crashService.checkAutoCashouts();
      if (autoCashouts && autoCashouts.length > 0) {
        // Отправляем обновление баланса для каждого автовывода
        for (const cashout of autoCashouts) {
          this.server.emit('auto_cashout_success', {
            userId: cashout.userId,
            username: cashout.username,
            multiplier: cashout.multiplier,
            profit: cashout.profit,
            newBalance: cashout.newBalance,
          });
        }
        this.broadcastRoundState();
      }
    }, 50); // Check every 50ms
  }

  private stopAutoCashoutChecker() {
    if (this.autoCashoutInterval) {
      clearInterval(this.autoCashoutInterval);
      this.autoCashoutInterval = null;
    }
  }

  private broadcastRoundState() {
    const state = this.crashService.getRoundState();
    this.server.emit('round_state', state);
  }

  broadcastMultiplierUpdate() {
    const round = this.crashService.getCurrentRound();
    if (round.state === RoundState.RUNNING) {
      const multiplier = this.crashService.getCurrentMultiplier();
      this.server.emit('multiplier_update', {
        multiplier,
        serverTime: Date.now(),
      });
    }
  }
}
