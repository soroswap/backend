import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { configLoader } from './config/config-loader';
import { envSchema } from './config/env-schema';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PairsModule } from './pairs/pairs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configLoader],
      validationSchema: envSchema,
    }),
    AuthModule,
    PrismaModule,
    PairsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
