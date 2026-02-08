import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UpgradesService {
  constructor(private prisma: PrismaService) {}

  async upgradeItem(userId: string, fromItemId: string, toItemId: string) {
    const [fromInventoryItem, toItem] = await Promise.all([
      this.prisma.inventoryItem.findFirst({
        where: { id: fromItemId, userId, isSold: false },
        include: { item: true },
      }),
      this.prisma.item.findUnique({ where: { id: toItemId } }),
    ]);

    if (!fromInventoryItem) {
      throw new NotFoundException('Предмет не найден в инвентаре');
    }

    if (!toItem) {
      throw new NotFoundException('Целевой предмет не найден');
    }

    // Calculate upgrade chance based on price difference
    const priceDiff = toItem.basePrice - fromInventoryItem.item.basePrice;
    
    if (priceDiff <= 0) {
      throw new BadRequestException('Целевой предмет должен быть дороже');
    }

    // Calculate chance: smaller difference = higher chance
    // Formula: base 50% - (priceDiff / fromPrice * 100) * 0.3
    // Max 80%, Min 5%
    const priceRatio = priceDiff / fromInventoryItem.item.basePrice;
    let chance = 50 - (priceRatio * 30);
    chance = Math.max(5, Math.min(80, chance));

    const success = Math.random() * 100 < chance;

    return await this.prisma.$transaction(async (tx) => {
      // Remove the old item
      await tx.inventoryItem.delete({
        where: { id: fromItemId },
      });

      // Log the upgrade attempt
      await tx.upgradeLog.create({
        data: {
          userId,
          itemId: fromInventoryItem.itemId,
          success,
          chance,
        },
      });

      let newItem = null;
      if (success) {
        // Add the new item
        newItem = await tx.inventoryItem.create({
          data: {
            userId,
            itemId: toItemId,
          },
          include: { item: true },
        });
      }

      return {
        success,
        chance: Math.round(chance),
        item: success ? newItem.item : null,
        message: success
          ? `Успешно! Вы получили ${toItem.name}`
          : `Неудача. Предмет утерян. Шанс был ${Math.round(chance)}%`,
      };
    });
  }

  async getAvailableUpgrades(itemId: string) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Предмет не найден');
    }

    // Get items that are more expensive (potential upgrades)
    const upgrades = await this.prisma.item.findMany({
      where: {
        basePrice: { gt: item.basePrice },
        isActive: true,
      },
      orderBy: { basePrice: 'asc' },
      take: 20,
    });

    // Calculate chance for each upgrade
    return upgrades.map(upgrade => {
      const priceDiff = upgrade.basePrice - item.basePrice;
      const priceRatio = priceDiff / item.basePrice;
      let chance = 50 - (priceRatio * 30);
      chance = Math.max(5, Math.min(80, chance));

      return {
        ...upgrade,
        chance: Math.round(chance),
        priceDiff: priceDiff,
      };
    });
  }
}
