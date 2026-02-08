import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private deleteAvatarFile(filename: string) {
    if (!filename) return;
    
    const filePath = path.join(process.cwd(), 'uploads', 'avatars', filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Ошибка при удалении файла аватара:', error);
      }
    }
  }

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

  async updateAvatar(userId: string, filename: string) {
    // Получаем старый аватар пользователя
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    // Удаляем старый файл аватара, если он существует
    if (user?.avatar) {
      this.deleteAvatarFile(user.avatar);
    }

    // Обновляем аватар в базе данных
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: filename },
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
    // Получаем текущий аватар пользователя
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    // Удаляем файл аватара, если он существует
    if (user?.avatar) {
      this.deleteAvatarFile(user.avatar);
    }

    // Удаляем аватар из базы данных
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
