import { Module } from '@nestjs/common';
import { PairsService } from './pairs.service';
import { PairsController } from './pairs.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
@Module({
    imports: [ PrismaModule ],
    controllers: [PairsController],
    providers: [PairsService],
    exports: [PairsService],
})
export class PairsModule { }