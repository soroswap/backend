import { Module } from '@nestjs/common';
import { InfoService } from './info.service';
import { InfoController } from './info.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [InfoController],
  providers: [InfoService],
  exports: [InfoService],
})
export class InfoModule {}
