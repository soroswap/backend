import {
  Query,
  Body,
  Controller,
  Get,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { NetworkApiQuery } from 'src/decorators';
import { PairsService } from './pairs.service';

import { subscribeToLedgerEntriesDto } from './dto/subscribe.dto';
import { AllPoolsRequestBodyDto, AllPoolsResponseDto } from './dto/pools.dto';
import { QueryNetworkDto } from 'src/dto';

@Controller('pairs')
export class PairsController {
  constructor(private readonly pairsService: PairsService) {}

  @Post()
  async subscribeToPairs(@Body() body: subscribeToLedgerEntriesDto) {
    return await this.pairsService.subscribeToPairs(body);
  }

  @Get('count')
  async getPairsCount() {
    return await this.pairsService.getPairsCountFromDB();
  }

  @Get('mercury-count')
  async getCount() {
    const counter = await this.pairsService.getPairsCountFromMercury();
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
