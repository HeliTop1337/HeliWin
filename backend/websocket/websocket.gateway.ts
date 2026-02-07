import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:4001', 'http://localhost:3000'],
    credentials: true,
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private onlineUsers = new Map<string, string>();
  private recentWins: any[] = []; // Хранилище последних 35 выигрышей

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    
    // Отправляем последние выигрыши новому клиенту
    if (this.recentWins.length > 0) {
      client.emit('recentWins', this.recentWins);
      console.log(`Sent ${this.recentWins.length} recent wins to client ${client.id}`);
    }
    
    // Отправляем текущее количество онлайн пользователей
    this.broadcastOnlineCount();
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.onlineUsers.delete(client.id);
    this.broadcastOnlineCount();
  }

  @SubscribeMessage('user:online')
  handleUserOnline(client: Socket, userId: string) {
    this.onlineUsers.set(client.id, userId);
    this.broadcastOnlineCount();
    console.log(`User ${userId} is online. Total online: ${this.onlineUsers.size}`);
  }

  @SubscribeMessage('user:offline')
  handleUserOffline(client: Socket) {
    this.onlineUsers.delete(client.id);
    this.broadcastOnlineCount();
  }

  broadcastCaseOpened(userId: string, username: string, item: any, caseName: string, casePrice?: number) {
    // Вычисляем множитель выигрыша
    const multiplier = casePrice && casePrice > 0 ? item.basePrice / casePrice : 0;
    
    const winData = {
      id: `${Date.now()}-${userId}`,
      userId, // Добавляем userId для определения открывшего
      username,
      itemName: item.name,
      itemRarity: item.rarity,
      itemPrice: item.basePrice,
      itemIcon: item.icon,
      caseName,
      timestamp: Date.now(),
      multiplier: multiplier > 0 ? multiplier : undefined,
    };
    
    // Добавляем в историю выигрышей
    this.recentWins.unshift(winData);
    
    // Оставляем только последние 35
    if (this.recentWins.length > 35) {
      this.recentWins = this.recentWins.slice(0, 35);
    }
    
    // Отправляем всем подключенным клиентам
    this.server.emit('itemDropped', winData);
    
    console.log(`Broadcasted win: ${item.name} (${item.rarity}) by user ${userId} - Total wins in history: ${this.recentWins.length}`);
  }

  broadcastBattleUpdate(battleId: string, data: any) {
    this.server.emit(`battle:${battleId}:update`, data);
  }

  broadcastBalanceUpdate(userId: string, balance: number) {
    this.server.emit(`user:${userId}:balance`, { balance });
  }

  private broadcastOnlineCount() {
    this.server.emit('online:count', {
      count: this.onlineUsers.size,
    });
  }
}
