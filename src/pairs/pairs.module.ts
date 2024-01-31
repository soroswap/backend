import { Module } from '@nestjs/common';
import { PairsService } from './services/pairs.service';
import { PairsController } from './controllers/pairs.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
@Module({
    imports: [ PrismaModule ],
    controllers: [PairsController],
    providers: [PairsService],
    exports: [], //services to export
})
export class PairsModule { }