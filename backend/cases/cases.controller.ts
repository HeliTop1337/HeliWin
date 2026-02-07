import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { CasesService } from './cases.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cases')
export class CasesController {
  constructor(private casesService: CasesService) {}

  @Get()
  getAllCases() {
    return this.casesService.getAllCases();
  }

  @Get(':id')
  getCaseById(@Param('id') id: string) {
    return this.casesService.getCaseById(id);
  }

  @Post(':id/open')
  @UseGuards(JwtAuthGuard)
  openCase(@Param('id') id: string, @Req() req: any) {
    return this.casesService.openCase(req.user.id, id);
  }
}
