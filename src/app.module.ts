import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
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
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configLoader],
      validationSchema: envSchema,
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          username: 'default',
          password: 'KfyTrLBWVcAQiXagnuYxMiVHVjaZFNPj',
          socket: {
            host: configLoader().redis.host,
            port: configLoader().redis.port,
          },
        }),
      }),
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
