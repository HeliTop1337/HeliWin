import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { BattlesService } from './battles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString, IsInt, Min, Max } from 'class-validator';

class CreateBattleDto {
  @IsString()
  caseId: string;

  @IsInt()
  @Min(2)
  @Max(4)
  maxPlayers: number;
}

@Controller('battles')
export class BattlesController {
  constructor(private battlesService: BattlesService) {}

  @Get()
  getActiveBattles() {
    return this.battlesService.getActiveBattles();
  }

  @Get(':id')
  getBattleById(@Param('id') id: string) {
    return this.battlesService.getBattleById(id);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  createBattle(@Body() dto: CreateBattleDto, @Req() req: any) {
    return this.battlesService.createBattle(req.user.id, dto.caseId, dto.maxPlayers);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  joinBattle(@Param('id') id: string, @Req() req: any) {
    return this.battlesService.joinBattle(req.user.id, id);
  }
}
