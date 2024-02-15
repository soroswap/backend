import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
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
  async subscribeToPairs(@Body() body: subscribeToLedgerEntriesDto) {
    return await this.pairsService.subscribeToSoroswapPairs(body);
  }

  @Get('count')
  async getPairsCount() {
    return await this.pairsService.getSoroswapPairsCountFromDB();
  }

  @Get('mercury-count')
  async getCount() {
    const counter = await this.pairsService.getSoroswapPairsCountFromMercury();
    return { 'Pairs count on mercury': counter };
  }

  @ApiOkResponse({
    description: 'return all pools',
    type: [AllPoolsResponseDto],
  })
  @NetworkApiQuery()
  @Post('/all')
  getAllPools(@Query() query: QueryNetworkDto) {
    if (query.network === 'testnet') {
      return this.pairsService.getAllPools();
    } else {
      throw new BadRequestException('Network not supported');
    }
  }
}
