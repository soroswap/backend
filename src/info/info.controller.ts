import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Param,
} from '@nestjs/common';
import { ApiHeader, ApiOkResponse } from '@nestjs/swagger';

import { NetworkApiQuery } from 'src/decorators';
import { InfoService } from './info.service';

import { QueryNetworkDto } from 'src/dto';

@ApiHeader({
  name: 'apiKey',
  description: 'API Key',
})
@Controller('info')
export class InfoController {
  constructor(private readonly infoService: InfoService) {}

  @Get('/tokenTvl/:token')
  async getTokenTvl(@Param('token') token: string) {
    return await this.infoService.getTokenTvl(token);
  }

  @Get('/poolTvl/:pool')
  async getPoolTvl(@Param('pool') pool: string) {
    return await this.infoService.getPoolTvl(pool);
  }

  @Get('/price/xlm/:token')
  async getTokenPriceInXLM(@Param('token') token: string) {
    return await this.infoService.getTokenPriceInXLM(token);
  }

  @Get('/price/usdc/:token')
  async getTokenPriceInUSDC(@Param('token') token: string) {
    return await this.infoService.getTokenPriceInUSDC(token);
  }

  @Get('/price/:token')
  async getTokenPrice(@Param('token') token: string) {
    return await this.infoService.getTokenPriceInUSD(token);
  }
}
