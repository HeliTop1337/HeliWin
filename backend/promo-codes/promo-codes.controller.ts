import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { PromoCodesService } from './promo-codes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString } from 'class-validator';

class RedeemPromoCodeDto {
  @IsString()
  code: string;
}

@Controller('promo-codes')
@UseGuards(JwtAuthGuard)
export class PromoCodesController {
  constructor(private promoCodesService: PromoCodesService) {}

  @Post('redeem')
  redeemPromoCode(@Body() dto: RedeemPromoCodeDto, @Req() req: any) {
    return this.promoCodesService.redeemPromoCode(req.user.id, dto.code);
  }

  @Get('history')
  getPromoHistory(@Req() req: any) {
    return this.promoCodesService.getUserPromoHistory(req.user.id);
  }
}
