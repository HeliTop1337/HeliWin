import { Module } from '@nestjs/common';
import { BattlesService } from './battles.service';
import { BattlesController } from './battles.controller';
import { CasesModule } from '../cases/cases.module';

@Module({
  imports: [CasesModule],
  providers: [BattlesService],
  controllers: [BattlesController],
  exports: [BattlesService],
})
export class BattlesModule {}
