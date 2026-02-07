import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async createCase(data: any, adminId: string) {
    const caseData = await this.prisma.case.create({ data });
    await this.logAction(adminId, 'CREATE_CASE', 'Case', caseData.id);
    return caseData;
  }

  async updateCase(id: string, data: any, adminId: string) {
    const caseData = await this.prisma.case.update({ where: { id }, data });
    await this.logAction(adminId, 'UPDATE_CASE', 'Case', id);
    return caseData;
  }

  async deleteCase(id: string, adminId: string) {
    await this.prisma.case.delete({ where: { id } });
    await this.logAction(adminId, 'DELETE_CASE', 'Case', id);
    return { message: 'Кейс удален' };
  }

  async getAllCases() {
    return this.prisma.case.findMany({
      include: {
        items: {
          include: { item: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createItem(data: any, adminId: string) {
    const item = await this.prisma.item.create({ data });
    await this.logAction(adminId, 'CREATE_ITEM', 'Item', item.id);
    return item;
  }

  async updateItem(id: string, data: any, adminId: string) {
    const item = await this.prisma.item.update({ where: { id }, data });
    await this.logAction(adminId, 'UPDATE_ITEM', 'Item', id);
    return item;
  }

  async deleteItem(id: string, adminId: string) {
    await this.prisma.item.delete({ where: { id } });
    await this.logAction(adminId, 'DELETE_ITEM', 'Item', id);
    return { message: 'Предмет удален' };
  }

  async getAllItems() {
    return this.prisma.item.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getAllUsers(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          username: true,
          balance: true,
          role: true,
          isBanned: true,
          banReason: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async banUser(userId: string, reason: string, adminId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: true, banReason: reason },
    });
    await this.logAction(adminId, 'BAN_USER', 'User', userId, reason);
    return user;
  }

  async unbanUser(userId: string, adminId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: false, banReason: null },
    });
    await this.logAction(adminId, 'UNBAN_USER', 'User', userId);
    return user;
  }

  async adjustBalance(userId: string, amount: number, reason: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return await this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: amount } },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: 'ADMIN_ADJUSTMENT',
          amount,
          balanceBefore: user.balance,
          balanceAfter: user.balance + amount,
          description: reason || 'Корректировка баланса администратором',
        },
      });

      await this.logAction(adminId, 'ADJUST_BALANCE', 'User', userId, `Сумма: ${amount}, Причина: ${reason}`);

      return updatedUser;
    });
  }

  async createPromoCode(data: any, adminId: string) {
    const promoData: any = {
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.value,
      maxUses: data.maxUses,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      caseId: data.caseId || undefined,
    };

    const promoCode = await this.prisma.promoCode.create({ 
      data: promoData 
    });

    // If type is ITEM, create the relationship
    if (data.type === 'ITEM' && data.itemId) {
      await this.prisma.promoCodeItem.create({
        data: {
          promoCodeId: promoCode.id,
          itemId: data.itemId,
        },
      });
    }

    await this.logAction(adminId, 'CREATE_PROMO_CODE', 'PromoCode', promoCode.id);
    return promoCode;
  }

  async getAllPromoCodes() {
    const promoCodes = await this.prisma.promoCode.findMany({
      include: {
        items: {
          include: { item: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Manually fetch case data for CASE_DROP type promo codes
    const promoCodesWithCases = await Promise.all(
      promoCodes.map(async (promo) => {
        if (promo.caseId) {
          const caseData = await this.prisma.case.findUnique({
            where: { id: promo.caseId },
          });
          return { ...promo, case: caseData };
        }
        return promo;
      })
    );

    return promoCodesWithCases;
  }

  async deletePromoCode(id: string, adminId: string) {
    await this.prisma.promoCode.delete({ where: { id } });
    await this.logAction(adminId, 'DELETE_PROMO_CODE', 'PromoCode', id);
    return { message: 'Промокод удален' };
  }

  async getStats() {
    const [
      totalUsers,
      totalCases,
      totalItems,
      totalDrops,
      totalRevenue,
      recentDrops,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.case.count(),
      this.prisma.item.count(),
      this.prisma.itemDrop.count(),
      this.prisma.transaction.aggregate({
        where: { type: 'CASE_PURCHASE' },
        _sum: { amount: true },
      }),
      this.prisma.itemDrop.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { username: true },
          },
          item: true,
          case: true,
        },
      }),
    ]);

    return {
      totalUsers,
      totalCases,
      totalItems,
      totalDrops,
      totalRevenue: Math.abs(totalRevenue._sum.amount || 0),
      recentDrops,
    };
  }

  async getLogs(limit = 100) {
    return this.prisma.adminLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  private async logAction(
    adminId: string,
    action: string,
    targetType?: string,
    targetId?: string,
    details?: string,
  ) {
    await this.prisma.adminLog.create({
      data: {
        adminId,
        action,
        targetType,
        targetId,
        details,
      },
    });
  }
}
