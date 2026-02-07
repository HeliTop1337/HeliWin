import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  getInventory(@Req() req: any) {
    return this.inventoryService.getInventory(req.user.id);
  }

  @Post(':id/sell')
  sellItem(@Param('id') id: string, @Req() req: any) {
    return this.inventoryService.sellItem(req.user.id, id);
  }
}
