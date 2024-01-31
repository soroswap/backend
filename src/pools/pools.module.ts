import { Module } from '@nestjs/common';
import { PoolsController } from './pools.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PoolsService } from './pools.service';
import { PairsModule } from 'src/pairs/pairs.module';

@Module({
    imports: [PrismaModule, PairsModule],
    controllers: [PoolsController],
    providers: [PoolsService],
})
export class PoolsModule {}
