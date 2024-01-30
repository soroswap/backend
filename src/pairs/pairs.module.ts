import { Module } from '@nestjs/common';
import { PairsService } from './services/pairs.service';
import { PairsController } from './controllers/pairs.controller';

@Module({
    imports: [
        //import ORM and modules to use
        //Pass entities to ORM
    ],
    controllers: [PairsController],
    providers: [PairsService],
    exports: [], //services to export
})
export class PairsModule { }