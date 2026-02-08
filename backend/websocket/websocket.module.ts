import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { WebsocketGateway } from './websocket.gateway';
import { CrashGateway } from './crash.gateway';
import { CrashModule } from '../crash/crash.module';

@Module({
  imports: [
    CrashModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [WebsocketGateway, CrashGateway],
  exports: [WebsocketGateway, CrashGateway],
})
export class WebsocketModule {}
