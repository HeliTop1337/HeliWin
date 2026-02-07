import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ItemsModule } from './items/items.module';
import { CasesModule } from './cases/cases.module';
import { InventoryModule } from './inventory/inventory.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PromoCodesModule } from './promo-codes/promo-codes.module';
import { UpgradesModule } from './upgrades/upgrades.module';
import { BattlesModule } from './battles/battles.module';
import { AdminModule } from './admin/admin.module';
import { WebsocketModule } from './websocket/websocket.module';
import { ContractModule } from './contract/contract.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.RATE_LIMIT_TTL || '60'),
      limit: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ItemsModule,
    CasesModule,
    InventoryModule,
    TransactionsModule,
    PromoCodesModule,
    UpgradesModule,
    BattlesModule,
    AdminModule,
    WebsocketModule,
    ContractModule,
  ],
})
export class AppModule {}
