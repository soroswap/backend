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

  @Get('/soroswapTvl')
  async getSoroswapTvl() {
    return await this.infoService.getSoroswapTvl();
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

  @Get('liquidity/:pool')
  async getLiquidity(@Param('pool') pool: string) {
    return await this.infoService.getPoolShares(pool);
  }

  @Get('/volume24h')
  async getSoroswapVolume24h() {
    return this.infoService.getSoroswapVolume(1);
  }

  @Get('/tokenVolume24h/:token')
  async getTokenVolume24h(@Param('token') token: string) {
    return this.infoService.getTokenVolume(token, 1);
  }
}
