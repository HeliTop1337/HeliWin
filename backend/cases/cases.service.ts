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
      );

      return result;
    });
  }

  private selectRandomItem(caseItems: any[], caseName: string) {
    // Улучшенная система шансов с подкруткой для дорогих кейсов
    const adjustedItems = caseItems.map(ci => {
      let adjustedChance = ci.dropChance;
      
      // Подкрутка шансов в зависимости от типа кейса
      if (caseName.includes('Легендарный')) {
        // Легендарный кейс: значительно повышаем шансы на редкие предметы
        if (ci.item.rarity === 'LEGENDARY') {
          adjustedChance *= 8; // 1% -> 8%
        } else if (ci.item.rarity === 'EXCEPTIONAL') {
          adjustedChance *= 5; // 4% -> 20%
        } else if (ci.item.rarity === 'RARE') {
          adjustedChance *= 3; // 10% -> 30%
        }
      } else if (caseName.includes('Премиум')) {
        // Премиум кейс: умеренно повышаем шансы
        if (ci.item.rarity === 'EXCEPTIONAL') {
          adjustedChance *= 3; // 4% -> 12%
        } else if (ci.item.rarity === 'RARE') {
          adjustedChance *= 2; // 10% -> 20%
        }
      } else {
        // Стартовый кейс: немного повышаем шансы на необычные предметы
        if (ci.item.rarity === 'UNCOMMON') {
          adjustedChance *= 1.5; // 25% -> 37.5%
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
