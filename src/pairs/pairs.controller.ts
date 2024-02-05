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
    const count = await this.pairsService.getPairsCountFromDB();
    if (!count) {
      await this.pairsService.saveMercuryPairsCount(0);
    }
    return await this.pairsService.getPairsCountFromDB();
  }

  @Post('count')
  async savePairsCount(@Body() body: { number: number }) {
    return await this.pairsService.saveMercuryPairsCount(body.number);
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
