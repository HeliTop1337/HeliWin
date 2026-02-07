import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async getAllItems() {
    return this.prisma.item.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getItemById(id: string) {
    return this.prisma.item.findUnique({
      where: { id },
    });
  }
}
