import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async getUserTransactions(userId: string, limit = 50) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getTransactionStats(userId: string) {
    const [deposits, withdrawals, spent] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { userId, type: 'DEPOSIT' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { userId, type: 'WITHDRAWAL' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { userId, type: 'CASE_PURCHASE' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalDeposits: deposits._sum.amount || 0,
      totalWithdrawals: Math.abs(withdrawals._sum.amount || 0),
      totalSpent: Math.abs(spent._sum.amount || 0),
    };
  }
}
