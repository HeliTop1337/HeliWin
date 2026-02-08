import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContractService {
  constructor(private prisma: PrismaService) {}

  async createContract(userId: string, itemIds: string[]) {
    console.log('Creating contract for user:', userId);
    console.log('Item IDs:', itemIds);
    
    if (itemIds.length < 3 || itemIds.length > 10) {
      throw new BadRequestException('Необходимо от 3 до 10 предметов');
    }

    // Проверяем, что все предметы принадлежат пользователю
    const inventoryItems = await this.prisma.inventoryItem.findMany({
      where: {
        id: { in: itemIds },
        userId,
        isSold: false,
      },
      include: { item: true },
    });

    console.log('Found inventory items:', inventoryItems.length);

    if (inventoryItems.length !== itemIds.length) {
      console.log('Items mismatch. Expected:', itemIds.length, 'Found:', inventoryItems.length);
      throw new BadRequestException('Некоторые предметы не найдены в вашем инвентаре');
    }

    // Вычисляем общую стоимость
    const totalValue = inventoryItems.reduce((sum, item) => sum + item.item.basePrice, 0);
    const minValue = totalValue * 0.8;
    const maxValue = totalValue * 1.2;

    // Получаем все предметы в диапазоне цен
    const availableItems = await this.prisma.item.findMany({
      where: {
        basePrice: {
          gte: minValue,
          lte: maxValue,
        },
        isActive: true,
      },
    });

    if (availableItems.length === 0) {
      throw new BadRequestException('Нет доступных предметов для контракта');
    }

    // Выбираем случайный предмет
    const wonItem = availableItems[Math.floor(Math.random() * availableItems.length)];

    return await this.prisma.$transaction(async (tx) => {
      // Удаляем использованные предметы
      await tx.inventoryItem.deleteMany({
        where: {
          id: { in: itemIds },
        },
      });

      // Добавляем новый предмет
      await tx.inventoryItem.create({
        data: {
          userId,
          itemId: wonItem.id,
        },
      });

      // Получаем обновленный баланс пользователя
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      return {
        item: wonItem,
        newBalance: user.balance,
      };
    });
  }
}
