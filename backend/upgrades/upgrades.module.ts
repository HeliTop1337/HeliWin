import { Module } from '@nestjs/common';
import { UpgradesService } from './upgrades.service';
import { UpgradesController } from './upgrades.controller';

@Module({
  providers: [UpgradesService],
  controllers: [UpgradesController],
})
export class UpgradesModule {}
