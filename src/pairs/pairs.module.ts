import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PairsController } from './pairs.controller';
import { PairsService } from './pairs.service';
@Module({
  imports: [PrismaModule],
  controllers: [PairsController],
  providers: [PairsService],
  exports: [PairsService],
})
export class PairsModule {}
