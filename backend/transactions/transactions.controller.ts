import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  getUserTransactions(@Req() req: any, @Query('limit') limit?: string) {
    return this.transactionsService.getUserTransactions(
      req.user.id,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get('stats')
  getTransactionStats(@Req() req: any) {
    return this.transactionsService.getTransactionStats(req.user.id);
  }
}
