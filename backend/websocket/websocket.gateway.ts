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

  private onlineUsers = new Map<string, string>(); // socketId -> userId
  private onlineIPs = new Map<string, Set<string>>(); // IP -> Set of socketIds
  private recentWins: any[] = []; // Хранилище последних 35 выигрышей

  handleConnection(client: Socket) {
    const clientIP = this.getClientIP(client);
    console.log(`Client connected: ${client.id} from IP: ${clientIP}`);
    
    // Добавляем socket ID к IP адресу
    if (!this.onlineIPs.has(clientIP)) {
      this.onlineIPs.set(clientIP, new Set());
    }
    this.onlineIPs.get(clientIP).add(client.id);
    
    // Отправляем последние выигрыши новому клиенту
    if (this.recentWins.length > 0) {
      client.emit('recentWins', this.recentWins);
      console.log(`Sent ${this.recentWins.length} recent wins to client ${client.id}`);
    }
    
    // Отправляем текущее количество онлайн пользователей
    this.broadcastOnlineCount();
  }

  handleDisconnect(client: Socket) {
    const clientIP = this.getClientIP(client);
    console.log(`Client disconnected: ${client.id} from IP: ${clientIP}`);
    
    // Удаляем socket ID из IP адреса
    if (this.onlineIPs.has(clientIP)) {
      this.onlineIPs.get(clientIP).delete(client.id);
      
      // Если у IP больше нет активных подключений, удаляем IP
      if (this.onlineIPs.get(clientIP).size === 0) {
        this.onlineIPs.delete(clientIP);
      }
    }
    
    this.onlineUsers.delete(client.id);
    this.broadcastOnlineCount();
  }

  @SubscribeMessage('user:online')
  handleUserOnline(client: Socket, userId: string) {
    this.onlineUsers.set(client.id, userId);
    this.broadcastOnlineCount();
    const clientIP = this.getClientIP(client);
    console.log(`User ${userId} is online from IP ${clientIP}. Total unique IPs: ${this.onlineIPs.size}`);
  }

  @SubscribeMessage('user:offline')
  handleUserOffline(client: Socket) {
    this.onlineUsers.delete(client.id);
    this.broadcastOnlineCount();
  }

  private getClientIP(client: Socket): string {
    // Получаем IP из заголовков или handshake
    const forwarded = client.handshake.headers['x-forwarded-for'];
    const realIP = client.handshake.headers['x-real-ip'];
    
    let ip: string;
    
    if (forwarded) {
      // x-forwarded-for может содержать несколько IP, берем первый
      ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
    } else if (realIP) {
      ip = Array.isArray(realIP) ? realIP[0] : realIP;
    } else {
      // Fallback на address из handshake
      ip = client.handshake.address || 'unknown';
    }
    
    // Нормализуем localhost адреса
    if (ip === '::1' || ip === '::ffff:127.0.0.1' || ip === '127.0.0.1') {
      return 'localhost';
    }
    
    // Убираем IPv6 префикс для IPv4 адресов
    if (ip.startsWith('::ffff:')) {
      return ip.substring(7);
    }
    
    return ip;
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
    // Считаем количество уникальных IP адресов
    const uniqueIPCount = this.onlineIPs.size;
    
    this.server.emit('online:count', {
      count: uniqueIPCount,
    });
    
    console.log(`Broadcasting online count: ${uniqueIPCount} unique IPs`);
  }
}
