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

  @Get('/tvl/:token')
  async getHello(@Param('token') token: string) {
    return await this.infoService.getTokenTvl(token);
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
    return await this.infoService.getTokenPrice(token);
  }
}
