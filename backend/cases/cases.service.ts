import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class CasesService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => WebsocketGateway))
    private websocketGateway: WebsocketGateway,
  ) {}

  async openCase(userId: string, caseId: string) {
    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: {
        items: {
          include: { item: true },
        },
      },
    });

    if (!caseData || !caseData.isActive) {
      throw new NotFoundException('Кейс не найден');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const finalPrice = caseData.price * (1 - caseData.discount / 100);

    if (user.balance < finalPrice) {
      throw new BadRequestException('Недостаточно средств');
    }

    const droppedItem = this.selectRandomItem(caseData.items, caseData.name);

    return await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: finalPrice } },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: 'CASE_PURCHASE',
          amount: -finalPrice,
          balanceBefore: user.balance,
          balanceAfter: user.balance - finalPrice,
          description: `Открыт кейс: ${caseData.name}`,
        },
      });

      const inventoryItem = await tx.inventoryItem.create({
        data: {
          userId,
          itemId: droppedItem.itemId,
        },
        include: { item: true },
      });

      await tx.itemDrop.create({
        data: {
          userId,
          caseId,
          itemId: droppedItem.itemId,
        },
      });

      const result = {
        item: inventoryItem.item,
        newBalance: user.balance - finalPrice,
      };

      // Broadcast to WebSocket
      this.websocketGateway.broadcastCaseOpened(
        userId,
        user.username,
        inventoryItem.item,
        caseData.name,
        finalPrice,
      );

      return result;
    });
  }

  private selectRandomItem(caseItems: any[], caseName: string) {
    // Используем шансы из базы данных (dropChance)
    // Для легендарного кейса шансы уже настроены через скрипт update-case-chances.ts
    const adjustedItems = caseItems.map(ci => {
      let adjustedChance = ci.dropChance;
      
      // Подкрутка шансов только для не-легендарных кейсов
      if (!caseName.includes('Легендарный')) {
        if (caseName.includes('Премиум') || caseName.includes('Мастерский')) {
          // Премиум/Мастерский кейс
          if (ci.item.rarity === 'MASTER') {
            adjustedChance *= 3;
          } else if (ci.item.rarity === 'VETERAN') {
            adjustedChance *= 2;
          }
        } else if (caseName.includes('Ветеранский')) {
          // Ветеранский кейс
          if (ci.item.rarity === 'VETERAN') {
            adjustedChance *= 2.5;
          } else if (ci.item.rarity === 'STALKER') {
            adjustedChance *= 1.5;
          }
        } else {
          // Стартовый/Сталкерский кейс
          if (ci.item.rarity === 'STALKER') {
            adjustedChance *= 1.5;
          }
        }
      }
      
      return { ...ci, adjustedChance };
    });

    const totalChance = adjustedItems.reduce((sum, ci) => sum + ci.adjustedChance, 0);
    let random = Math.random() * totalChance;

    for (const caseItem of adjustedItems) {
      random -= caseItem.adjustedChance;
      if (random <= 0) {
        return caseItem;
      }
    }

    return adjustedItems[0];
  }

  async getAllCases() {
    return this.prisma.case.findMany({
      where: { isActive: true },
      include: {
        items: {
          include: { item: true },
        },
      },
    });
  }

  async getCaseById(id: string) {
    const caseData = await this.prisma.case.findUnique({
      where: { id },
      include: {
        items: {
          include: { item: true },
        },
      },
    });

    if (!caseData) {
      throw new NotFoundException('Кейс не найден');
    }

    return caseData;
  }
}
