import { Module } from '@nestjs/common';
import { PairsModule } from 'src/pairs/pairs.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UtilsModule } from 'src/Utils/utils.module';
import { InfoController } from './info.controller';
import { InfoService } from './info.service';
@Module({
  imports: [PrismaModule, PairsModule, UtilsModule],
  controllers: [InfoController],
  providers: [InfoService],
  exports: [InfoService],
})
export class InfoModule {}
