import { Module } from '@nestjs/common';
import { PoolsController } from './pools.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PoolsService } from './pools.service';

@Module({
    imports: [PrismaModule],
    controllers: [PoolsController],
    providers: [PoolsService],
})
export class PoolsModule {}
