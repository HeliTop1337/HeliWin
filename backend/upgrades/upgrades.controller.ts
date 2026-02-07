import { Controller, Post, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { UpgradesService } from './upgrades.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upgrades')
@UseGuards(JwtAuthGuard)
export class UpgradesController {
  constructor(private upgradesService: UpgradesService) {}

  @Post()
  upgradeItem(
    @Req() req: any,
    @Body('fromItemId') fromItemId: string,
    @Body('toItemId') toItemId: string,
  ) {
    return this.upgradesService.upgradeItem(req.user.id, fromItemId, toItemId);
  }

  @Get('available/:itemId')
  getAvailableUpgrades(@Param('itemId') itemId: string) {
    return this.upgradesService.getAvailableUpgrades(itemId);
  }
}
