import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getInventory(userId: string) {
    return this.prisma.inventoryItem.findMany({
      where: { userId, isSold: false },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async sellItem(userId: string, inventoryItemId: string) {
    const inventoryItem = await this.prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId },
      include: { item: true },
    });

    if (!inventoryItem || inventoryItem.userId !== userId) {
      throw new NotFoundException('Предмет не найден');
    }

    if (inventoryItem.isSold) {
      throw new BadRequestException('Предмет уже продан');
    }

    const sellPrice = inventoryItem.item.basePrice;

    return await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });

      await tx.inventoryItem.update({
        where: { id: inventoryItemId },
        data: {
          isSold: true,
          soldAt: new Date(),
          soldPrice: sellPrice,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: sellPrice } },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: 'ITEM_SALE',
          amount: sellPrice,
          balanceBefore: user.balance,
          balanceAfter: user.balance + sellPrice,
          description: `Продан предмет: ${inventoryItem.item.name}`,
        },
      });

      return {
        newBalance: user.balance + sellPrice,
        soldPrice: sellPrice,
      };
    });
  }
}
