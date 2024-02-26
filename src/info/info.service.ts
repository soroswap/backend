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
import { getRouterAddress } from 'src/utils/getRouterAddress';
import { getContractEventsParser } from 'src/utils/parsers/getContractEventsParser';
import { GET_CONTRACT_EVENTS } from 'src/utils/queries';

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

  async getTokenTvl(token: string, inheritedPools?: any[]) {
    let pools;
    if (!inheritedPools) {
      pools = await this.pairs.getAllPools(['soroswap']);
    } else {
      pools = inheritedPools;
    }

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
    console.log('\nLooking for', tokenSymbol, 'in Soroswap pools');
    for (const pool of filteredPools) {
      if (pool.token0 == token) {
        console.log('Pool', pool.contractId, 'has', pool.reserve0, tokenSymbol);
        tvl += parseFloat(pool.reserve0);
      } else if (pool.token1 == token) {
        console.log('Pool', pool.contractId, 'has', pool.reserve1, tokenSymbol);
        tvl += parseFloat(pool.reserve1);
      }
    }
    const tokenPrice = await this.getTokenPriceInUSD(token, undefined, pools);
    const tvlInUsd = tvl * tokenPrice.price;
    return { token, tvl, tvlInUsd };
  }

  async getTokenPriceInXLM(token: string, inheritedPools?: any[]) {
    let pools;
    if (!inheritedPools) {
      pools = await this.pairs.getAllPools(['soroswap']);
    } else {
      pools = inheritedPools;
    }
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
        return { token, price: 1 };
      }
      throw new ServiceUnavailableException(
        `No liquidity pool for this token and XLM`,
      );
    }

    const tokenXlmPool = filteredPools[0];
    if (tokenXlmPool.token0 === xlm.address) {
      const price = tokenXlmPool.reserve0 / tokenXlmPool.reserve1;
      return { token, price };
    } else {
      const price = tokenXlmPool.reserve1 / tokenXlmPool.reserve0;
      return { token, price };
    }
  }

  async getTokenPriceInUSDC(token: string, inheritedPools?: any[]) {
    let pools;
    if (!inheritedPools) {
      pools = await this.pairs.getAllPools(['soroswap']);
    } else {
      pools = inheritedPools;
    }
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
      const price = tokenXlmPool.reserve0 / tokenXlmPool.reserve1;
      return { token, price };
    } else {
      const price = tokenXlmPool.reserve1 / tokenXlmPool.reserve0;
      return { token, price };
    }
  }

  async getTokenPriceInUSD(
    token: string,
    xlmValue?: number,
    inheritedPools?: any[],
  ) {
    const valueInXlm = await this.getTokenPriceInXLM(token, inheritedPools);
    let price;
    if (!xlmValue) {
      const currentXlmValueInUsd = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd',
      );
      price = valueInXlm.price * currentXlmValueInUsd.data.stellar.usd;
    } else {
      price = valueInXlm.price * xlmValue;
    }
    return { token, price };
  }

  async getPoolTvl(
    poolAddress: string,
    xlmValue?: number,
    inheritedPools?: any[],
  ) {
    let pools;
    if (!inheritedPools) {
      pools = await this.pairs.getAllPools(['soroswap']);
    } else {
      pools = inheritedPools;
    }

    const filteredPools = pools.filter(
      (pool) => pool.contractId == poolAddress,
    );

    if (filteredPools.length === 0) {
      throw new ServiceUnavailableException('Liquidity pool not found');
    }

    const pool = filteredPools[0];
    const token0Price = await this.getTokenPriceInUSD(
      pool.token0,
      xlmValue,
      pools,
    );
    const token1Price = await this.getTokenPriceInUSD(
      pool.token1,
      xlmValue,
      pools,
    );
    const tvl =
      parseFloat(pool.reserve0) * token0Price.price +
      parseFloat(pool.reserve1) * token1Price.price;
    return { pool: poolAddress, tvl };
  }

  async getPoolShares(poolAddress: string, inheritedPools?: any[]) {
    let pools;
    if (!inheritedPools) {
      pools = await this.pairs.getAllPools(['soroswap']);
    } else {
      pools = inheritedPools;
    }

    const filteredPools = pools.filter(
      (pool) => pool.contractId == poolAddress,
    );

    if (filteredPools.length === 0) {
      throw new ServiceUnavailableException('Liquidity pool not found');
    }

    const pool = filteredPools[0];
    return { pool: poolAddress, shares: pool.totalShares };
  }

  async getSoroswapTvl() {
    const pools = await this.pairs.getAllPools(['soroswap']);
    const xlmValue = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd',
    );

    let tvl = 0;
    for (const pool of pools) {
      const token0Price = await this.getTokenPriceInUSD(
        pool.token0,
        xlmValue.data.stellar.usd,
        pools,
      );
      const token1Price = await this.getTokenPriceInUSD(
        pool.token1,
        xlmValue.data.stellar.usd,
        pools,
      );
      tvl +=
        parseFloat(pool.reserve0) * token0Price.price +
        parseFloat(pool.reserve1) * token1Price.price;
    }
    return tvl;
  }

  async getContractEvents() {
    const routerAddress = await getRouterAddress();

    const mercuryResponse = await mercuryInstance.getCustomQuery({
      request: GET_CONTRACT_EVENTS,
      variables: { contractId: routerAddress },
    });

    const parsedContractEvents = getContractEventsParser(mercuryResponse.data!);

    return parsedContractEvents;
  }

  async getSoroswapVolume24h() {
    const contractEvents = await this.getContractEvents();
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const pools = await this.pairs.getAllPools(['soroswap']);
    const xlmValue = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd',
    );

    let volume = 0;
    for (const event of contractEvents) {
      const timeDiff = now.getTime() - event.closeTime.getTime();
      if (timeDiff < oneDay * 7) {
        if (event.topic2 == 'add' || event.topic2 == 'remove') {
          const tokenPriceA = await this.getTokenPriceInUSD(
            event.token_a,
            xlmValue.data.stellar.usd,
            pools,
          );
          const tokenPriceB = await this.getTokenPriceInUSD(
            event.token_b,
            xlmValue.data.stellar.usd,
            pools,
          );
          volume += parseFloat(event.amount_a) * tokenPriceA.price;
          volume += parseFloat(event.amount_b) * tokenPriceB.price;
        } else if (event.topic2 == 'swap') {
          for (let i = 0; i < event.amounts.length; i++) {
            const tokenPrice = await this.getTokenPriceInUSD(
              event.path[i],
              xlmValue.data.stellar.usd,
              pools,
            );
            volume += parseFloat(event.amounts[i]) * tokenPrice.price;
          }
        }
      }
    }
    return volume;
  }
}
