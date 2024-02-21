import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Mercury } from 'mercury-sdk';
import * as sdk from 'stellar-sdk';
import { PrismaService } from 'src/prisma/prisma.service';
import { PairsService } from 'src/pairs/pairs.service';
import { constants } from 'src/constants';
import axios from 'axios';

const mercuryInstance = new Mercury({
  backendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT,
  graphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT,
  email: process.env.MERCURY_TESTER_EMAIL,
  password: process.env.MERCURY_TESTER_PASSWORD,
});

@Injectable()
export class InfoService {
  constructor(
    private prisma: PrismaService,
    private pairs: PairsService,
  ) {}

  async getTokenTvl(token: string) {
    const pools = await this.pairs.getAllPools(['soroswap']);

    const { data } = await axios.get('https://api.soroswap.finance/api/tokens');
    const testnetTokens = data.find(
      (item) => item.network === 'testnet',
    ).tokens;
    const tokenSymbol = testnetTokens.find(
      (item) => item.address === token,
    ).symbol;

    const filteredPools = pools.filter(
      (pool) => pool.token0 == token || pool.token1 == token,
    );
    let tvl = 0;
    console.log('Looking for', tokenSymbol, 'in Soroswap pools');
    for (const pool of filteredPools) {
      if (pool.token0 == token) {
        console.log('Pool', pool.contractId, 'has', pool.reserve0, tokenSymbol);
        tvl += parseFloat(pool.reserve0);
      } else if (pool.token1 == token) {
        console.log('Pool', pool.contractId, 'has', pool.reserve1, tokenSymbol);
        tvl += parseFloat(pool.reserve1);
      }
    }

    const tokenPrice = await this.getTokenPrice(token);
    const tvlInUsd = tvl * tokenPrice;
    return { token, tvl, tvlInUsd };
  }

  async getTokenPriceInXLM(token: string) {
    const pools = await this.pairs.getAllPools(['soroswap']);
    const { data } = await axios.get('https://api.soroswap.finance/api/tokens');
    const testnetTokens = data.find(
      (item) => item.network === 'testnet',
    ).tokens;
    const xlm = testnetTokens.find((item) => item.symbol === 'XLM');

    const filteredPools = pools.filter(
      (pool) =>
        (pool.token0 == token && pool.token1 == xlm.address) ||
        (pool.token0 == xlm.address && pool.token1 == token),
    );

    if (filteredPools.length === 0) {
      if (token === xlm.address) {
        return 1;
      }
      throw new ServiceUnavailableException(
        'No liquidity pool for this token and XLM',
      );
    }

    const tokenXlmPool = filteredPools[0];
    if (tokenXlmPool.token0 === xlm.address) {
      return tokenXlmPool.reserve0 / tokenXlmPool.reserve1;
    } else {
      return tokenXlmPool.reserve1 / tokenXlmPool.reserve0;
    }
  }

  async getTokenPriceInUSDC(token: string) {
    const pools = await this.pairs.getAllPools(['soroswap']);
    const { data } = await axios.get('https://api.soroswap.finance/api/tokens');
    const testnetTokens = data.find(
      (item) => item.network === 'testnet',
    ).tokens;
    const usdc = testnetTokens.find((item) => item.symbol === 'USDC');

    const filteredPools = pools.filter(
      (pool) =>
        (pool.token0 == token && pool.token1 == usdc.address) ||
        (pool.token0 == usdc.address && pool.token1 == token),
    );

    if (filteredPools.length === 0) {
      throw new ServiceUnavailableException(
        'No liquidity pool for this token and USDC',
      );
    }

    const tokenXlmPool = filteredPools[0];
    if (tokenXlmPool.token0 === usdc.address) {
      return tokenXlmPool.reserve0 / tokenXlmPool.reserve1;
    } else {
      return tokenXlmPool.reserve1 / tokenXlmPool.reserve0;
    }
  }

  async getTokenPrice(token: string) {
    const currentXlmValueInUsd = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd',
    );

    const valueInXlm = await this.getTokenPriceInXLM(token);
    return valueInXlm * currentXlmValueInUsd.data.stellar.usd;
  }
}
