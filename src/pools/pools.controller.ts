import { Controller, Post, Get, Query, Body } from '@nestjs/common';
import { PoolsService } from './pools.service';
import { ApiOkResponse } from '@nestjs/swagger';
import { NetworkApiQuery } from 'src/decorators';
import { AllPoolsRequestBodyDto, AllPoolsResponseDto } from './dto/pools.dto';
import { QueryNetworkDto } from 'src/dto';

@Controller('pools')
export class PoolsController {
    constructor( 
        private readonly poolsService: PoolsService) {

    }
    @Get('/all')
    findAll() {
        return this.poolsService.findAll();
    }

    @ApiOkResponse({ description: 'return all pools', type: [AllPoolsResponseDto] })
    @NetworkApiQuery()
    @Post('/all_pools')
    getAllPools(@Body() body: AllPoolsRequestBodyDto, @Query() query: QueryNetworkDto): Promise<AllPoolsResponseDto>{
        return this.poolsService.getAllPools(body);
    }
}
