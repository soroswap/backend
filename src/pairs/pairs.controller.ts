import { Query, Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { NetworkApiQuery } from 'src/decorators';
import { PairsService } from './pairs.service';

import { subscribeToLedgerEntriesDto } from './dto/subscribe.dto';
import { AllPoolsRequestBodyDto, AllPoolsResponseDto } from './dto/pools.dto';
import { QueryNetworkDto } from 'src/dto';

@Controller('pairs')
export class PairsController {
  constructor(private readonly pairsService: PairsService) { }
  @Get()
  async findAll() {
    return await this.pairsService.findAllPairs();
  }

  @Post()
  async subscribeToPairs(@Body() body: subscribeToLedgerEntriesDto) {
    return await this.pairsService.subscribeToPairs(body);
  }

  @Get('count')
  async getPairsCount() {
    return await this.pairsService.getMercuryPairsCount();
  }


  @ApiOkResponse({ description: 'return all pools', type: [AllPoolsResponseDto] })
  @NetworkApiQuery()
  @Post('/all_pools')
  getAllPools(@Body() body: AllPoolsRequestBodyDto, @Query() query: QueryNetworkDto): Promise<AllPoolsResponseDto>{
      return this.pairsService.getAllPools(body);
  }
}