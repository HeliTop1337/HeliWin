import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BattlesService {
  constructor(private prisma: PrismaService) {}

  async createBattle(userId: string, caseId: string, maxPlayers: number) {
    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData || !caseData.isActive) {
      throw new NotFoundException('Кейс не найден');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const finalPrice = caseData.price * (1 - caseData.discount / 100);

    if (user.balance < finalPrice) {
      throw new BadRequestException('Недостаточно средств');
    }

    return await this.prisma.$transaction(async (tx) => {
      const battle = await tx.battle.create({
        data: {
          caseId,
          maxPlayers,
          status: 'waiting',
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: finalPrice } },
      });

      await tx.battlePlayer.create({
        data: {
          battleId: battle.id,
          userId,
          position: 1,
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: 'CASE_PURCHASE',
          amount: -finalPrice,
          balanceBefore: user.balance,
          balanceAfter: user.balance - finalPrice,
          description: `Присоединился к батлу: ${battle.id}`,
        },
      });

      return battle;
    });
  }

  async joinBattle(userId: string, battleId: string) {
    const battle = await this.prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        players: true,
        case: true,
      },
    });

    if (!battle || battle.status !== 'waiting') {
      throw new BadRequestException('Батл недоступен');
    }

    if (battle.players.length >= battle.maxPlayers) {
      throw new BadRequestException('Батл заполнен');
    }

    const alreadyJoined = battle.players.some((p) => p.userId === userId);
    if (alreadyJoined) {
      throw new BadRequestException('Вы уже присоединились к этому батлу');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const finalPrice = battle.case.price * (1 - battle.case.discount / 100);

    if (user.balance < finalPrice) {
      throw new BadRequestException('Недостаточно средств');
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: finalPrice } },
      });

      await tx.battlePlayer.create({
        data: {
          battleId,
          userId,
          position: battle.players.length + 1,
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: 'CASE_PURCHASE',
          amount: -finalPrice,
          balanceBefore: user.balance,
          balanceAfter: user.balance - finalPrice,
          description: `Присоединился к батлу: ${battleId}`,
        },
      });

      const updatedBattle = await tx.battle.findUnique({
        where: { id: battleId },
        include: { players: true },
      });

      if (updatedBattle.players.length === battle.maxPlayers) {
        await tx.battle.update({
          where: { id: battleId },
          data: { status: 'in_progress', startedAt: new Date() },
        });
      }

      return updatedBattle;
    });
  }

  async getActiveBattles() {
    return this.prisma.battle.findMany({
      where: {
        status: { in: ['waiting', 'in_progress'] },
      },
      include: {
        case: true,
        players: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBattleById(battleId: string) {
    const battle = await this.prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        case: true,
        players: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        drops: {
          include: {
            item: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!battle) {
      throw new NotFoundException('Батл не найден');
    }

    return battle;
  }
}
