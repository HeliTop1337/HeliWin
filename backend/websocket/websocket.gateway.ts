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

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
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
  }

  broadcastCaseOpened(userId: string, username: string, item: any, caseName: string) {
    this.server.emit('itemDropped', {
      id: `${Date.now()}-${userId}`,
      username,
      itemName: item.name,
      itemRarity: item.rarity,
      caseName,
      timestamp: Date.now(),
    });
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
