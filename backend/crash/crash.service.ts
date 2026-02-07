import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum RoundState {
  CRASH = 'CRASH',
  POST_CRASH_WAIT = 'POST_CRASH_WAIT',
  RESET = 'RESET',
  COUNTDOWN = 'COUNTDOWN',
  RUNNING = 'RUNNING',
}

export interface Bet {
  userId: string;
  username: string;
  amount: number;
  type: 'balance' | 'item';
  itemId?: string;
  autoCashout: number;
  cashoutMultiplier?: number;
  cashedOut: boolean;
  profit?: number;
}

export interface RoundData {
  roundId: string;
  state: RoundState;
  crashMultiplier: number;
  startTime?: number;
  crashTime?: number;
  postCrashWaitStartTime?: number;
  resetStartTime?: number;
  countdownStartTime?: number;
  bets: Map<string, Bet>;
  history: number[];
}

@Injectable()
export class CrashService {
  private readonly logger = new Logger(CrashService.name);
  
  private currentRound: RoundData;
  private roundHistory: number[] = [];
  
  // Timings
  private readonly POST_CRASH_WAIT_DURATION = 3000; // 3s - пауза после краша
  private readonly RESET_DURATION = 1000; // 1s - анимация восстановления
  private readonly COUNTDOWN_DURATION = 10000; // 10s - ожидание ставок
  
  constructor(private prisma: PrismaService) {
    this.initializeRound();
  }

  private initializeRound() {
    this.currentRound = {
      roundId: this.generateRoundId(),
      state: RoundState.COUNTDOWN,
      crashMultiplier: this.generateCrashMultiplier(),
      bets: new Map(),
      history: [...this.roundHistory],
    };
  }

  private generateRoundId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCrashMultiplier(): number {
    // Максимум 20x
    const random = Math.random();
    
    // 40% шанс на 1.00-2.00x
    if (random < 0.4) {
      return parseFloat((1.00 + Math.random()).toFixed(2));
    }
    // 30% шанс на 2.00-5.00x
    else if (random < 0.7) {
      return parseFloat((2.00 + Math.random() * 3).toFixed(2));
    }
    // 20% шанс на 5.00-10.00x
    else if (random < 0.9) {
      return parseFloat((5.00 + Math.random() * 5).toFixed(2));
    }
    // 10% шанс на 10.00-20.00x
    else {
      return parseFloat((10.00 + Math.random() * 10).toFixed(2));
    }
  }

  getCurrentRound(): RoundData {
    return this.currentRound;
  }

  getServerTime(): number {
    return Date.now();
  }

  getRoundState() {
    const serverTime = this.getServerTime();
    return {
      roundId: this.currentRound.roundId,
      state: this.currentRound.state,
      serverTime,
      startTime: this.currentRound.startTime,
      crashMultiplier: this.currentRound.state === RoundState.RUNNING || 
                       this.currentRound.state === RoundState.CRASH || 
                       this.currentRound.state === RoundState.POST_CRASH_WAIT ||
                       this.currentRound.state === RoundState.RESET
        ? this.currentRound.crashMultiplier
        : undefined,
      countdownStartTime: this.currentRound.countdownStartTime,
      countdownDuration: this.COUNTDOWN_DURATION,
      postCrashWaitStartTime: this.currentRound.postCrashWaitStartTime,
      postCrashWaitDuration: this.POST_CRASH_WAIT_DURATION,
      resetStartTime: this.currentRound.resetStartTime,
      resetDuration: this.RESET_DURATION,
      history: this.currentRound.history,
      bets: Array.from(this.currentRound.bets.values()).map(bet => ({
        username: bet.username,
        amount: bet.amount,
        type: bet.type,
        autoCashout: bet.autoCashout,
        cashedOut: bet.cashedOut,
        cashoutMultiplier: bet.cashoutMultiplier,
      })),
    };
  }

  async placeBet(
    userId: string,
    username: string,
    amount: number,
    type: 'balance' | 'item',
    autoCashout: number,
    itemId?: string,
  ): Promise<{ success: boolean; error?: string; newBalance?: number }> {
    // Check state - ставки только во время COUNTDOWN
    if (this.currentRound.state !== RoundState.COUNTDOWN) {
      return { success: false, error: 'Ставки закрыты' };
    }

    // Check if user already has a bet
    if (this.currentRound.bets.has(userId)) {
      return { success: false, error: 'У вас уже есть ставка в этом раунде' };
    }

    // Validate autoCashout
    if (autoCashout < 1.01 && autoCashout !== Infinity) {
      return { success: false, error: 'Автовывод должен быть минимум 1.01x' };
    }

    try {
      if (type === 'balance') {
        // Check balance
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user || user.balance < amount) {
          return { success: false, error: 'Недостаточно средств' };
        }

        // Deduct balance
        const updatedUser = await this.prisma.user.update({
          where: { id: userId },
          data: { balance: { decrement: amount } },
        });

        // Create transaction
        await this.prisma.transaction.create({
          data: {
            userId,
            type: 'CRASH_BET',
            amount: -amount,
            balanceBefore: user.balance,
            balanceAfter: updatedUser.balance,
            description: `Ставка в Crash: ${amount} ₽`,
            metadata: JSON.stringify({ roundId: this.currentRound.roundId }),
          },
        });

        // Add bet
        this.currentRound.bets.set(userId, {
          userId,
          username,
          amount,
          type,
          itemId,
          autoCashout,
          cashedOut: false,
        });

        return { success: true, newBalance: updatedUser.balance };
      } else if (type === 'item' && itemId) {
        // Check item ownership
        const item = await this.prisma.inventoryItem.findFirst({
          where: {
            id: itemId,
            userId,
            isSold: false,
          },
          include: { item: true },
        });

        if (!item) {
          return { success: false, error: 'Предмет не найден' };
        }

        // Mark item as sold
        await this.prisma.inventoryItem.update({
          where: { id: itemId },
          data: {
            isSold: true,
            soldAt: new Date(),
            soldPrice: item.item.basePrice,
          },
        });

        // Add bet
        this.currentRound.bets.set(userId, {
          userId,
          username,
          amount: item.item.basePrice,
          type,
          itemId,
          autoCashout,
          cashedOut: false,
        });

        return { success: true };
      }

      return { success: false, error: 'Неверный тип ставки' };
    } catch (error) {
      this.logger.error(`Error placing bet: ${error.message}`);
      return { success: false, error: 'Не удалось сделать ставку' };
    }
  }

  async cashout(userId: string): Promise<{ success: boolean; error?: string; multiplier?: number; profit?: number; newBalance?: number }> {
    if (this.currentRound.state !== RoundState.RUNNING) {
      return { success: false, error: 'Сейчас нельзя забрать выигрыш' };
    }

    const bet = this.currentRound.bets.get(userId);
    if (!bet) {
      return { success: false, error: 'Нет активной ставки' };
    }

    if (bet.cashedOut) {
      return { success: false, error: 'Вы уже забрали выигрыш' };
    }

    const currentMultiplier = this.getCurrentMultiplier();
    const profit = bet.amount * currentMultiplier;

    bet.cashedOut = true;
    bet.cashoutMultiplier = currentMultiplier;
    bet.profit = profit;

    // Add balance
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { balance: { increment: profit } },
    });

    // Create transaction
    await this.prisma.transaction.create({
      data: {
        userId,
        type: 'CRASH_WIN',
        amount: profit,
        balanceBefore: updatedUser.balance - profit,
        balanceAfter: updatedUser.balance,
        description: `Выигрыш в Crash: ${currentMultiplier.toFixed(2)}x`,
        metadata: JSON.stringify({ 
          roundId: this.currentRound.roundId,
          multiplier: currentMultiplier,
        }),
      },
    });

    return { success: true, multiplier: currentMultiplier, profit, newBalance: updatedUser.balance };
  }

  getCurrentMultiplier(): number {
    if (this.currentRound.state !== RoundState.RUNNING) {
      return 1.00;
    }

    const elapsed = Date.now() - this.currentRound.startTime;
    const multiplier = Math.pow(Math.E, elapsed / 10000);
    
    return Math.min(parseFloat(multiplier.toFixed(2)), this.currentRound.crashMultiplier);
  }

  async startCountdown() {
    this.currentRound.state = RoundState.COUNTDOWN;
    this.currentRound.countdownStartTime = Date.now();
    this.logger.log(`Round ${this.currentRound.roundId}: COUNTDOWN phase started (10s betting)`);
  }

  async startRound() {
    this.currentRound.state = RoundState.RUNNING;
    this.currentRound.startTime = Date.now();
    this.logger.log(`Round ${this.currentRound.roundId}: RUNNING phase started, crash at ${this.currentRound.crashMultiplier}x`);
  }

  async crashRound() {
    this.currentRound.state = RoundState.CRASH;
    this.currentRound.crashTime = Date.now();
    this.logger.log(`Round ${this.currentRound.roundId}: CRASH at ${this.currentRound.crashMultiplier}x`);

    // Process auto-cashouts and losses
    for (const [userId, bet] of this.currentRound.bets) {
      if (!bet.cashedOut) {
        // Loss - already deducted
        await this.prisma.transaction.create({
          data: {
            userId,
            type: 'CRASH_LOSS',
            amount: -bet.amount,
            balanceBefore: 0,
            balanceAfter: 0,
            description: `Проигрыш в Crash`,
            metadata: JSON.stringify({ 
              roundId: this.currentRound.roundId,
              crashMultiplier: this.currentRound.crashMultiplier,
            }),
          },
        });
      }
    }
  }

  async startPostCrashWait() {
    this.currentRound.state = RoundState.POST_CRASH_WAIT;
    this.currentRound.postCrashWaitStartTime = Date.now();
    this.logger.log(`Round ${this.currentRound.roundId}: POST_CRASH_WAIT phase (3s pause)`);
  }

  async resetRound() {
    this.currentRound.state = RoundState.RESET;
    this.currentRound.resetStartTime = Date.now();
    this.roundHistory.unshift(this.currentRound.crashMultiplier);
    if (this.roundHistory.length > 20) {
      this.roundHistory = this.roundHistory.slice(0, 20);
    }
    this.logger.log(`Round ${this.currentRound.roundId}: RESET phase (recovery animation)`);
  }

  async prepareNextRound() {
    this.initializeRound();
    this.logger.log(`New round ${this.currentRound.roundId} prepared`);
  }

  async checkAutoCashouts() {
    if (this.currentRound.state !== RoundState.RUNNING) return [];

    const currentMultiplier = this.getCurrentMultiplier();
    const autoCashouts: Array<{ userId: string; username: string; multiplier: number; profit: number; newBalance: number }> = [];

    for (const [userId, bet] of this.currentRound.bets) {
      if (!bet.cashedOut && bet.autoCashout !== Infinity && currentMultiplier >= bet.autoCashout) {
        const result = await this.cashout(userId);
        if (result.success) {
          autoCashouts.push({
            userId,
            username: bet.username,
            multiplier: result.multiplier!,
            profit: result.profit!,
            newBalance: result.newBalance!,
          });
        }
      }
    }

    return autoCashouts;
  }
}
