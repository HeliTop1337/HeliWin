import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PromoCodesService {
  constructor(private prisma: PrismaService) {}

  async redeemPromoCode(userId: string, code: string) {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
      include: { 
        items: { include: { item: true } }
      },
    });

    if (!promoCode || !promoCode.isActive) {
      throw new NotFoundException('Промокод не найден или неактивен');
    }

    if (promoCode.expiresAt && promoCode.expiresAt < new Date()) {
      throw new BadRequestException('Промокод истек');
    }

    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      throw new BadRequestException('Промокод исчерпан');
    }

    const existingUsage = await this.prisma.promoCodeUsage.findUnique({
      where: {
        promoCodeId_userId: {
          promoCodeId: promoCode.id,
          userId,
        },
      },
    });

    if (existingUsage) {
      throw new BadRequestException('Вы уже использовали этот промокод');
    }

    return await this.prisma.$transaction(async (tx) => {
      let message = '';
      let newBalance = 0;

      const user = await tx.user.findUnique({ where: { id: userId } });

      switch (promoCode.type) {
        case 'BALANCE':
          await tx.user.update({
            where: { id: userId },
            data: { balance: { increment: promoCode.value } },
          });
          await tx.transaction.create({
            data: {
              userId,
              type: 'PROMO_CODE',
              amount: promoCode.value,
              balanceBefore: user.balance,
              balanceAfter: user.balance + promoCode.value,
              description: `Промокод: ${code}`,
            },
          });
          newBalance = user.balance + promoCode.value;
          message = `Вы получили ${promoCode.value} ₽`;
          break;

        case 'ITEM':
          if (promoCode.items.length > 0) {
            const item = promoCode.items[0].item;
            await tx.inventoryItem.create({
              data: {
                userId,
                itemId: item.id,
              },
            });
            message = `Вы получили предмет: ${item.name}`;
          }
          newBalance = user.balance;
          break;

        case 'DISCOUNT':
          // Store discount in user metadata or session
          message = `Активирована скидка ${promoCode.value}% на следующую покупку`;
          newBalance = user.balance;
          break;

        case 'CASE_DROP':
          // Increase drop chance for specific case
          // This will be handled in the case opening logic
          message = `Активирован бонус +${promoCode.value}% к шансу выпадения для выбранного кейса`;
          newBalance = user.balance;
          break;

        default:
          throw new BadRequestException('Неизвестный тип промокода');
      }

      await tx.promoCodeUsage.create({
        data: {
          promoCodeId: promoCode.id,
          userId,
        },
      });

      await tx.promoCode.update({
        where: { id: promoCode.id },
        data: { usedCount: { increment: 1 } },
      });

      return { message, newBalance };
    });
  }

  async getUserPromoHistory(userId: string) {
    const usages = await this.prisma.promoCodeUsage.findMany({
      where: { userId },
      include: {
        promoCode: true,
      },
      orderBy: { usedAt: 'desc' },
    });

    return usages.map(usage => ({
      code: usage.promoCode.code,
      type: usage.promoCode.type,
      value: usage.promoCode.value,
      usedAt: usage.usedAt,
    }));
  }
}
