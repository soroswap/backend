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

  @Post()
  async subscribeToPairs(@Body() body: subscribeToLedgerEntriesDto) {
    return await this.pairsService.subscribeToPairs(body);
  }

  @Get('count')
  async getPairsCount(){
    const count = await this.pairsService.getMercuryPairsCount();
    if (!count) {
      await this.pairsService.saveMercuryPairsCount(0)
    }
    return await this.pairsService.getMercuryPairsCount();
  }
  
  @Post('count')
  async savePairsCount(@Body() body: {number:number}) {
    return await this.pairsService.saveMercuryPairsCount(body.number);
  }
  
  @Get('mercury-count')
  async getCount() {
    const counter = await this.pairsService.getPairCounter();
    return { 'Pairs count on mercury': counter }
  }

  @ApiOkResponse({ description: 'return all pools', type: [AllPoolsResponseDto] })
  @NetworkApiQuery()
  @Post('/all_pools')
  getAllPools(@Query() query: QueryNetworkDto){
      return this.pairsService.getAllPools();
  }
}