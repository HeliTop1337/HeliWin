import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        balance: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async getStats(userId: string) {
    const [totalDrops, totalSpent, inventoryCount, recentDrops] = await Promise.all([
      this.prisma.itemDrop.count({ where: { userId } }),
      this.prisma.transaction.aggregate({
        where: { userId, type: 'CASE_PURCHASE' },
        _sum: { amount: true },
      }),
      this.prisma.inventoryItem.count({
        where: { userId, isSold: false },
      }),
      this.prisma.itemDrop.findMany({
        where: { userId },
        include: {
          item: true,
          case: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Calculate total won from sold items
    const soldItems = await this.prisma.inventoryItem.findMany({
      where: { userId, isSold: true },
      select: { soldPrice: true },
    });

    const totalWon = soldItems.reduce((sum, item) => sum + (item.soldPrice || 0), 0);

    return {
      totalDrops,
      totalSpent: Math.abs(totalSpent._sum.amount || 0),
      totalWon,
      inventoryCount,
      recentDrops,
    };
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        email: true,
        username: true,
        balance: true,
        role: true,
        avatar: true,
      },
    });
  }

  async deleteAvatar(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
      select: {
        id: true,
        email: true,
        username: true,
        balance: true,
        role: true,
        avatar: true,
      },
    });
  }
}
