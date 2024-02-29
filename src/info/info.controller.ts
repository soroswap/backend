import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Param,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiParam,
  ApiOperation,
} from '@nestjs/swagger';

import { NetworkApiQuery } from 'src/decorators';
import { InfoService } from './info.service';

import { QueryNetworkDto } from 'src/dto';

@ApiHeader({
  name: 'apiKey',
  description: 'API Key required for authentication',
})
@Controller('info')
export class InfoController {
  constructor(private readonly infoService: InfoService) {}

  @Get('/tokenTvl/:token')
  @ApiOperation({
    summary: 'Get token TVL',
    description: 'Retrieve Total Value Locked for a specific token',
  })
  @ApiParam({ name: 'token', description: 'Token address', type: String })
  @ApiOkResponse({
    description:
      'Object with the address and Total Value Locked (in USD) for the given token',
  })
  async getTokenTvl(@Param('token') token: string) {
    return await this.infoService.getTokenTvl(token);
  }

  @Get('/poolTvl/:pool')
  @ApiOperation({
    summary: 'Get pool TVL',
    description: 'Retrieve Total Value Locked for a specific Liquidity Pool',
  })
  @ApiParam({
    name: 'pool',
    description: 'Liquidity Pool address',
    type: String,
  })
  @ApiOkResponse({
    description:
      'Object with the address and Total Value Locked (in USD) for the given pool',
  })
  async getPoolTvl(@Param('pool') pool: string) {
    return await this.infoService.getPoolTvl(pool);
  }

  @Get('/soroswapTvl')
  @ApiOperation({
    summary: 'Get Soroswap TVL',
    description: 'Retrieve Total Value Locked in the Soroswap DEX',
  })
  @ApiOkResponse({
    description:
      'Total Value Locked in USD for all pools in the Soroswap protocol',
  })
  async getSoroswapTvl() {
    return await this.infoService.getSoroswapTvl();
  }

  @Get('/price/xlm/:token')
  @ApiOperation({
    summary: 'Get token price in XLM',
    description:
      'Retrieve the value in XLM of a specific token, based on the amounts of the XLM/token pool.',
  })
  @ApiParam({ name: 'token', description: 'Token address', type: String })
  @ApiOkResponse({
    description:
      'Object with the address and equivalent value in XLM for the given token',
  })
  async getTokenPriceInXLM(@Param('token') token: string) {
    return await this.infoService.getTokenPriceInXLM(token);
  }

  @Get('/price/usdc/:token')
  @ApiOperation({
    summary: 'Get token price in USDC',
    description:
      'Retrieve the value in USDC of a specific token, based on the amounts of the USDC/token pool.',
  })
  @ApiParam({ name: 'token', description: 'Token address', type: String })
  @ApiOkResponse({
    description:
      'Object with the address and equivalent value in USDC for the given token',
  })
  async getTokenPriceInUSDC(@Param('token') token: string) {
    return await this.infoService.getTokenPriceInUSDC(token);
  }

  @Get('/price/:token')
  @ApiOperation({
    summary: 'Get token price in USD',
    description:
      'Retrieve the value in USD of a specific token, based on the amounts of the XLM/token pool and the XLM price in USD according to the CoinGecko API.',
  })
  @ApiParam({ name: 'token', description: 'Token address', type: String })
  @ApiOkResponse({
    description:
      'Object with the address and equivalent value in USD for the given token',
  })
  async getTokenPrice(@Param('token') token: string) {
    return await this.infoService.getTokenPriceInUSD(token);
  }

  @Get('liquidity/:pool')
  @ApiOperation({
    summary: 'Get liquidity of a pool',
    description:
      'Retrieve the total amount of liquidity shares of a specific pool',
  })
  @ApiParam({ name: 'pool', description: 'Pool address', type: String })
  @ApiOkResponse({
    description:
      'Object with the address and amount of liquidity shares of the given pool',
  })
  async getLiquidity(@Param('pool') pool: string) {
    return await this.infoService.getPoolShares(pool);
  }

  @Get('/volume24h')
  @ApiOperation({
    summary: 'Get Soroswap 24h volume',
    description:
      'Retrieve trading volume (in USD) in Soroswap for the last 24 hours',
  })
  @ApiOkResponse({
    description:
      'Amount in USD of volume traded in Soroswap for the last 24 hours',
  })
  async getSoroswapVolume24h() {
    return this.infoService.getSoroswapVolume(1);
  }

  @Get('/tokenVolume24h/:token')
  @ApiOperation({
    summary: 'Get token 24h volume',
    description:
      'Retrieve trading volume (in USD) in Soroswap of a specific token for the last 24 hours',
  })
  @ApiParam({ name: 'token', description: 'Token address', type: String })
  @ApiOkResponse({
    description:
      'Amount in USD of volume traded of the specified token in Soroswap for the last 24 hours',
  })
  async getTokenVolume24h(@Param('token') token: string) {
    return this.infoService.getTokenVolume(token, 1);
  }

  @Get('/tokenVolume7d/:token')
  @ApiOperation({
    summary: 'Get token 7d volume',
    description:
      'Retrieve trading volume (in USD) in Soroswap of a specific token for the last 7 days',
  })
  @ApiParam({ name: 'token', description: 'Token address', type: String })
  @ApiOkResponse({
    description:
      'Amount in USD of volume traded of the specified token in Soroswap for the last 7 days',
  })
  async getTokenVolume7d(@Param('token') token: string) {
    return this.infoService.getTokenVolume(token, 7);
  }

  @Get('/poolVolume24h/:pool')
  @ApiOperation({
    summary: 'Get pool 24h volume',
    description:
      'Retrieve trading volume (in USD) in Soroswap on a specific pool for the last 24 hours',
  })
  @ApiParam({ name: 'pool', description: 'Pool address', type: String })
  @ApiOkResponse({
    description:
      'Amount in USD of volume traded on the specified pool in Soroswap for the last 24 hours',
  })
  async getPoolVolume24h(@Param('pool') pool: string) {
    return this.infoService.getPoolVolume(pool, 1);
  }

  @Get('/poolVolume7d/:pool')
  @ApiOperation({
    summary: 'Get pool 7d volume',
    description:
      'Retrieve trading volume (in USD) in Soroswap on a specific pool for the last 7 days',
  })
  @ApiParam({ name: 'pool', description: 'Pool address', type: String })
  @ApiOkResponse({
    description:
      'Amount in USD of volume traded on the specified pool in Soroswap for the last 7 days',
  })
  async getPoolVolume7d(@Param('pool') pool: string) {
    return this.infoService.getPoolVolume(pool, 7);
  }

  @Get('/soroswapFees24h')
  @ApiOperation({
    summary: 'Get Soroswap 24h fees',
    description:
      'Retrieve trading fees (in USD) in Soroswap for the last 24 hours',
  })
  @ApiOkResponse({
    description:
      'Amount in USD of fees collected in Soroswap for the last 24 hours',
  })
  async getSoroswapFees24h() {
    return this.infoService.getSoroswapFees(1);
  }

  @Get('/poolFees24h/:pool')
  @ApiOperation({
    summary: 'Get pool 24h fees',
    description:
      'Retrieve trading fees (in USD) in Soroswap on a specific pool for the last 24 hours',
  })
  @ApiParam({ name: 'pool', description: 'Pool address', type: String })
  @ApiOkResponse({
    description:
      'Amount in USD of fees collected on the specified pool in Soroswap for the last 24 hours',
  })
  async getPoolFees24h(@Param('pool') pool: string) {
    return this.infoService.getPoolFees(pool, 1);
  }

  @Get('/poolFeesYearly/:pool')
  @ApiOperation({
    summary: 'Get pool yearly fees',
    description:
      'Retrieve trading fees (in USD) in Soroswap on a specific pool for the last year',
  })
  @ApiParam({ name: 'pool', description: 'Pool address', type: String })
  @ApiOkResponse({
    description:
      'Amount in USD of fees collected on the specified pool in Soroswap for the last year (365 days)',
  })
  async getPoolFeesYearly(@Param('pool') pool: string) {
    return this.infoService.getPoolFees(pool, 365);
  }

  @Get('/pool/:pool')
  @ApiOperation({
    summary: 'Get pool information',
    description: 'Retrieve all relevant information of a specific pool',
  })
  @ApiParam({ name: 'pool', description: 'Pool address', type: String })
  @ApiOkResponse({
    description:
      'Object with pool address, token addresses, token reserves, TVL, volume 24h, volume 7d, fees 24h and fees yearly of the specified pool',
  })
  async getPoolInfo(@Param('pool') pool: string) {
    return this.infoService.getPoolInfo(pool);
  }

  @Get('/pools')
  @ApiOperation({
    summary: 'Get all pools information',
    description: 'Retrieve all relevant information of every pool in Soroswap',
  })
  @ApiOkResponse({
    description:
      'Array of objects with pool address, token addresses, token reserves, TVL, volume 24h, volume 7d, fees 24h and fees yearly of each pool',
  })
  async getPoolsInfo() {
    return this.infoService.getPoolsInfo();
  }
}
