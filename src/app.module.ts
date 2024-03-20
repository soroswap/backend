import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { configLoader } from './config/config-loader';
import { envSchema } from './config/env-schema';
import { EventsModule } from './events/events.module';
import { InfoModule } from './info/info.module';
import { PairsModule } from './pairs/pairs.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configLoader],
      validationSchema: envSchema,
    }),
    AuthModule,
    PrismaModule,
    PairsModule,
    InfoModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
