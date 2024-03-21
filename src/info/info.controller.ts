import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { QueryNetworkDto } from 'src/dto';
import { InfoService } from './info.service';

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
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  @ApiParam({ name: 'token', description: 'Token address', type: String })
  @ApiOkResponse({
    description:
      'Object with the address and Total Value Locked (in USD) for the given token',
  })
  async getTokenTvl(
    @Query() query: QueryNetworkDto,
    @Param('token') token: string,
  ) {
    return await this.infoService.getTokenTvl(query.network, token);
  }

  @Get('/poolTvl/:pool')
  @ApiOperation({
    summary: 'Get pool TVL',
    description: 'Retrieve Total Value Locked for a specific Liquidity Pool',
  })
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  @ApiParam({
    name: 'pool',
    description: 'Liquidity Pool address',
    type: String,
  })
  @ApiOkResponse({
    description:
      'Object with the address and Total Value Locked (in USD) for the given pool',
  })
  async getPoolTvl(
    @Query() query: QueryNetworkDto,
    @Param('pool') pool: string,
  ) {
    return await this.infoService.getPoolTvl(query.network, pool);
  }

  @Get('/soroswapTvl')
  @ApiOperation({
    summary: 'Get Soroswap TVL',
    description: 'Retrieve Total Value Locked in the Soroswap DEX',
  })
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  @ApiOkResponse({
    description:
      'Total Value Locked in USD for all pools in the Soroswap protocol',
  })
  async getSoroswapTvl(@Query() query: QueryNetworkDto) {
    return await this.infoService.getSoroswapTvl(query.network);
  }

  @Get('/price/xlm/:token')
  @ApiOperation({
    summary: 'Get token price in XLM',
    description:
      'Retrieve the value in XLM of a specific token, based on the amounts of the XLM/token pool.',
  })
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  @ApiParam({ name: 'token', description: 'Token address', type: String })
  @ApiOkResponse({
    description:
      'Object with the address and equivalent value in XLM for the given token',
  })
  async getTokenPriceInXLM(
    @Query() query: QueryNetworkDto,
    @Param('token') token: string,
  ) {
    return await this.infoService.getTokenPriceInXLM(query.network, token);
  }

  @Get('/price/usdc/:token')
  @ApiOperation({
    summary: 'Get token price in USDC',
    description:
      'Retrieve the value in USDC of a specific token, based on the amounts of the USDC/token pool.',
  })
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  @ApiParam({ name: 'token', description: 'Token address', type: String })
  @ApiOkResponse({
    description:
      'Object with the address and equivalent value in USDC for the given token',
  })
  async getTokenPriceInUSDC(
    @Query() query: QueryNetworkDto,
    @Param('token') token: string,
  ) {
    return await this.infoService.getTokenPriceInUSDC(query.network, token);
  }

  @Get('/price/:token')
  @ApiOperation({
    summary: 'Get token price in USD',
    description:
      'Retrieve the value in USD of a specific token, based on the amounts of the XLM/token pool and the XLM price in USD according to the CoinGecko API.',
  })
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  @ApiParam({ name: 'token', description: 'Token address', type: String })
  @ApiOkResponse({
    description:
      'Object with the address and equivalent value in USD for the given token',
  })
  async getTokenPrice(
    @Query() query: QueryNetworkDto,
    @Param('token') token: string,
  ) {
    return await this.infoService.getTokenPriceInUSD(query.network, token);
  }

  @Get('liquidity/:pool')
  @ApiOperation({
    summary: 'Get liquidity of a pool',
    description:
      'Retrieve the total amount of liquidity shares of a specific pool',
  })
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  @ApiParam({ name: 'pool', description: 'Pool address', type: String })
  @ApiOkResponse({
    description:
      'Object with the address and amount of liquidity shares of the given pool',
  })
  async getLiquidity(
    @Query() query: QueryNetworkDto,
    @Param('pool') pool: string,
  ) {
    return await this.infoService.getPoolShares(query.network, pool);
  }

  @Get('/volume24h')
  @ApiOperation({
    summary: 'Get Soroswap 24h volume',
    description:
      'Retrieve trading volume (in USD) in Soroswap for the last 24 hours',
  })
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  @ApiOkResponse({
    description:
      'Amount in USD of volume traded in Soroswap for the last 24 hours',
  })
  async getSoroswapVolume24h(@Query() query: QueryNetworkDto) {
    return this.infoService.getSoroswapVolume(query.network, 1);
  }

  @Get('/soroswap/volume-chart')
  @ApiOperation({
    summary: 'Get Soroswap 24h volume',
    description: 'Retrieve Amount in USD of volume traded in Soroswap per day',
  })
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  @ApiOkResponse({
    description: 'Amount in USD of volume traded in Soroswap per day',
  })
  async getSoroswapVolumeChart(@Query() query: QueryNetworkDto) {
    return this.infoService.getSoroswapVolumeChart(query.network);
  }

  @Get('/soroswap/fees-chart')
  @ApiOperation({
    summary: 'Get Soroswap 24h volume',
    description: 'Retrieve Amount in USD of fees collected in Soroswap per day',
  })
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  @ApiOkResponse({
    description: 'Amount in USD of fees collected in Soroswap per day',
  })
  async getSoroswapFeesChart(@Query() query: QueryNetworkDto) {
    return this.infoService.getSoroswapFeesChart(query.network);
  }

  @Get('/tokenVolume24h/:token')
  @ApiOperation({
    summary: 'Get token 24h volume',
    description:
      'Retrieve trading volume (in USD) in Soroswap of a specific token for the last 24 hours',
  })
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  @ApiParam({ name: 'token', description: 'Token address', type: String })
  @ApiOkResponse({
    description:
      'Amount in USD of volume traded of the specified token in Soroswap for the last 24 hours',
  })
  async getTokenVolume24h(
    @Query() query: QueryNetworkDto,
    @Param('token') token: string,
  ) {
    return this.infoService.getTokenVolume(query.network, token, 1);
  }

  @Get('/tokenVolume7d/:token')
  @ApiOperation({
    summary: 'Get token 7d volume',
    description:
      'Retrieve trading volume (in USD) in Soroswap of a specific token for the last 7 days',
  })
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  @ApiParam({ name: 'token', description: 'Token address', type: String })
  @ApiOkResponse({
    description:
      'Amount in USD of volume traded of the specified token in Soroswap for the last 7 days',
  })
  async getTokenVolume7d(
    @Query() query: QueryNetworkDto,
    @Param('token') token: string,
  ) {
    return this.infoService.getTokenVolume(query.network, token, 7);
  }

  @Get('/poolVolume24h/:pool')
  @ApiOperation({
    summary: 'Get pool 24h volume',
    description:
      'Retrieve trading volume (in USD) in Soroswap on a specific pool for the last 24 hours',
  })
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  @ApiParam({ name: 'pool', description: 'Pool address', type: String })
  @ApiOkResponse({
    description:
      'Amount in USD of volume traded on the specified pool in Soroswap for the last 24 hours',
  })
  async getPoolVolume24h(
    @Query() query: QueryNetworkDto,
    @Param('pool') pool: string,
  ) {
    return this.infoService.getPoolVolume(query.network, pool, 1);
  }

  @Get('/poolVolume7d/:pool')
  @ApiOperation({
    summary: 'Get pool 7d volume',
    description:
      'Retrieve trading volume (in USD) in Soroswap on a specific pool for the last 7 days',
  })
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  @ApiParam({ name: 'pool', description: 'Pool address', type: String })
  @ApiOkResponse({
    description:
      'Amount in USD of volume traded on the specified pool in Soroswap for the last 7 days',
  })
  async getPoolVolume7d(
    @Query() query: QueryNetworkDto,
    @Param('pool') pool: string,
  ) {
    return this.infoService.getPoolVolume(query.network, pool, 7);
  }

  @Get('/soroswapFees24h')
  @ApiOperation({
    summary: 'Get Soroswap 24h fees',
    description:
      'Retrieve trading fees (in USD) in Soroswap for the last 24 hours',
  })
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  @ApiOkResponse({
    description:
      'Amount in USD of fees collected in Soroswap for the last 24 hours',
  })
  async getSoroswapFees24h(@Query() query: QueryNetworkDto) {
    return this.infoService.getSoroswapFees(query.network, 1);
  }

  @Get('/poolFees24h/:pool')
  @ApiOperation({
    summary: 'Get pool 24h fees',
    description:
      'Retrieve trading fees (in USD) in Soroswap on a specific pool for the last 24 hours',
  })
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  @ApiParam({ name: 'pool', description: 'Pool address', type: String })
  @ApiOkResponse({
    description:
      'Amount in USD of fees collected on the specified pool in Soroswap for the last 24 hours',
  })
  async getPoolFees24h(
    @Query() query: QueryNetworkDto,
    @Param('pool') pool: string,
  ) {
    return this.infoService.getPoolFees(query.network, pool, 1);
  }

  @Get('/poolFeesYearly/:pool')
  @ApiOperation({
    summary: 'Get pool yearly fees',
    description:
      'Retrieve trading fees (in USD) in Soroswap on a specific pool for the last year',
  })
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  @ApiParam({ name: 'pool', description: 'Pool address', type: String })
  @ApiOkResponse({
    description:
      'Amount in USD of fees collected on the specified pool in Soroswap for the last year (365 days)',
  })
  async getPoolFeesYearly(
    @Query() query: QueryNetworkDto,
    @Param('pool') pool: string,
  ) {
    return this.infoService.getPoolFees(query.network, pool, 365);
  }

  @Get('/pool/:pool')
  @ApiOperation({
    summary: 'Get pool information',
    description: 'Retrieve all relevant information of a specific pool',
  })
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  @ApiParam({ name: 'pool', description: 'Pool address', type: String })
  @ApiOkResponse({
    description:
      'Object with pool address, token addresses, token reserves, TVL, volume 24h, volume 7d, fees 24h and fees yearly of the specified pool',
  })
  async getPoolInfo(
    @Query() query: QueryNetworkDto,
    @Param('pool') pool: string,
  ) {
    return this.infoService.getPoolInfo(query.network, pool);
  }

  @Get('/pool/tvl-chart/:pool')
  @ApiOperation({
    summary: 'Get pool information',
    description: 'Retrieve TVL by day for the specified pool',
  })
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  @ApiParam({ name: 'pool', description: 'Pool address', type: String })
  @ApiOkResponse({
    description: 'Array of TVL by day for the specified pool',
  })
  async getPoolChartTVL(
    @Query() query: QueryNetworkDto,
    @Param('pool') pool: string,
  ) {
    return this.infoService.getPoolTVLChart(query.network, pool);
  }

  @Get('/pool/volume-chart/:pool')
  @ApiOperation({
    summary: 'Get pool information',
    description: 'Retrieve Volume by day for the specified pool',
  })
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  @ApiParam({ name: 'pool', description: 'Pool address', type: String })
  @ApiOkResponse({
    description: 'Array of Volume by day for the specified pool',
  })
  async getPoolVolumeChart(
    @Query() query: QueryNetworkDto,
    @Param('pool') pool: string,
  ) {
    return this.infoService.getPoolVolumeChart(query.network, pool);
  }

  @Get('/pool/fees-chart/:pool')
  @ApiOperation({
    summary: 'Get pool information',
    description: 'Retrieve Fees by day for the specified pool',
  })
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  @ApiParam({ name: 'pool', description: 'Pool address', type: String })
  @ApiOkResponse({
    description: 'Array of Fees by day for the specified pool',
  })
  async getPoolFeesChart(
    @Query() query: QueryNetworkDto,
    @Param('pool') pool: string,
  ) {
    return this.infoService.getPoolFeesChart(query.network, pool);
  }

  @Get('/pools')
  @ApiOperation({
    summary: 'Get all pools information',
    description: 'Retrieve all relevant information of every pool in Soroswap',
  })
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  @ApiOkResponse({
    description:
      'Array of objects with pool address, token addresses, token reserves, TVL, volume 24h, volume 7d, fees 24h and fees yearly of each pool',
  })
  async getPoolsInfo(@Query() query: QueryNetworkDto) {
    return this.infoService.getPoolsInfo(query.network);
  }

  @Get('/token/:token')
  @ApiOperation({
    summary: 'Get token information',
    description: 'Retrieve all relevant information of a specific token',
  })
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  @ApiParam({ name: 'token', description: 'Token address', type: String })
  @ApiOkResponse({
    description:
      'Object with token address, TVL, price, price change and volume 24h of the specified token',
  })
  async getTokenInfo(
    @Query() query: QueryNetworkDto,
    @Param('token') token: string,
  ) {
    return this.infoService.getTokenInfo(query.network, token);
  }

  @Get('/tokens')
  @ApiOperation({
    summary: 'Get all tokens information',
    description: 'Retrieve all relevant information of all tokens in Soroswap',
  })
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  @ApiOkResponse({
    description:
      'Array of objects with token address, TVL, price, price change and volume 24h of each token',
  })
  async getTokensInfo(@Query() query: QueryNetworkDto) {
    return this.infoService.getTokensInfo(query.network);
  }

  @Get('/xlmPrice')
  async getxlm() {
    return this.infoService.getXlmValue();
  }
}
