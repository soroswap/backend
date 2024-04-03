import { Module } from '@nestjs/common';
import { PairsModule } from 'src/pairs/pairs.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UtilsController } from './utils.controller';
import { UtilsService } from './utils.service';
@Module({
  imports: [PrismaModule, PairsModule],
  controllers: [UtilsController],
  providers: [UtilsService],
  exports: [UtilsService],
})
export class UtilsModule {}
