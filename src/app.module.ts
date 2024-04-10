import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { configLoader } from './config/config-loader';
import { envSchema } from './config/env-schema';
import { EventsModule } from './events/events.module';
import { InfoModule } from './info/info.module';
import { PairsModule } from './pairs/pairs.module';
import { PrismaModule } from './prisma/prisma.module';
import { UtilsModule } from './utils/utils.module';

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
    UtilsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
