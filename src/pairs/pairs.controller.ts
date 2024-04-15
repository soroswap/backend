import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiHeader, ApiOkResponse } from '@nestjs/swagger';

import { NetworkApiQuery } from 'src/decorators';
import { PairsService } from './pairs.service';

import { QueryNetworkDto } from 'src/dto';
import { AllPoolsResponseDto } from './dto/pools.dto';
import { subscribeToLedgerEntriesDto } from './dto/subscribe.dto';

@ApiHeader({
  name: 'apiKey',
  description: 'API Key',
})
@Controller('pairs')
export class PairsController {
  constructor(private readonly pairsService: PairsService) {}

  @Post()
  async subscribeToPairs(
    @Query() query: QueryNetworkDto,
    @Body() body: subscribeToLedgerEntriesDto,
  ) {
    return await this.pairsService.subscribeToSoroswapPairs(
      query.network,
      body,
    );
  }

  @Get('count')
  async getPairsCount(@Query() query: QueryNetworkDto) {
    return await this.pairsService.getSoroswapPairsCountFromDB(query.network);
  }

  @Get('mercury-count')
  async getCount(@Query() query: QueryNetworkDto) {
    const counter = await this.pairsService.getSoroswapPairsCountFromMercury(
      query.network,
    );
    return { 'Pairs count on mercury': counter };
  }

  @ApiOkResponse({
    description: 'return all pools',
    type: [AllPoolsResponseDto],
  })
  @NetworkApiQuery()
  @Post('/all')
  getAllPools(@Query() query: QueryNetworkDto) {
    if(query.protocols === undefined || query.protocols.length === 0) {
      return this.pairsService.getAllPools(query.network);
    }
    return this.pairsService.getAllPools(query.network, query.protocols);
  }
}
