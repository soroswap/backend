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
import { axiosApiBackendInstance } from 'src/utils/axios';

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

  async getPools(inheritedPools?: any[]) {
    if (!inheritedPools) {
      return await this.pairs.getAllPools(['soroswap']);
    } else {
      return inheritedPools;
    }
  }

  async getXlmValue(inheritedXlmValue?: number) {
    if (!inheritedXlmValue) {
      const currentXlmValueInUsd = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd',
      );
      return currentXlmValueInUsd.data.stellar.usd;
    } else {
      return inheritedXlmValue;
    }
  }

  async getContractEvents(inheritedContractEvents?: any[]) {
    if (inheritedContractEvents) {
      return inheritedContractEvents;
    }

    const routerAddress = await getRouterAddress();

    const mercuryResponse = await mercuryInstance.getCustomQuery({
      request: GET_CONTRACT_EVENTS,
      variables: { contractId: routerAddress },
    });

    const parsedContractEvents = getContractEventsParser(mercuryResponse.data!);

    return parsedContractEvents;
  }

  async getTokensList(inheritedTokens?: any[]) {
    if (inheritedTokens) {
      return inheritedTokens;
    } else {
      const { data } = await axiosApiBackendInstance.get('/api/tokens');
      return data;
    }
  }

  async getTokenTvl(
    token: string,
    inheritedXlmValue?: number,
    inheritedPools?: any[],
  ) {
    const pools = await this.getPools(inheritedPools);

    const filteredPools = pools.filter(
      (pool) => pool.token0 == token || pool.token1 == token,
    );
    let tvl = 0;
    for (const pool of filteredPools) {
      if (pool.token0 == token) {
        tvl += parseFloat(pool.reserve0) / 10 ** 7;
      } else if (pool.token1 == token) {
        tvl += parseFloat(pool.reserve1) / 10 ** 7;
      }
    }
    const tokenPrice = await this.getTokenPriceInUSD(
      token,
      inheritedXlmValue,
      pools,
    );
    const tvlInUsd = tvl * tokenPrice.price;
    return { token, tvl: tvlInUsd };
  }

  async getTokenPriceInXLM(
    token: string,
    inheritedPools?: any[],
    inheritedTokens?: any[],
  ) {
    const pools = await this.getPools(inheritedPools);
    const data = await this.getTokensList(inheritedTokens);
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

  async getTokenPriceInUSDC(
    token: string,
    inheritedPools?: any[],
    inheritedTokens?: any[],
  ) {
    const pools = await this.getPools(inheritedPools);
    const data = await this.getTokensList(inheritedTokens);
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
    inheritedXlmValue?: number,
    inheritedPools?: any[],
  ) {
    const valueInXlm = await this.getTokenPriceInXLM(token, inheritedPools);
    const xlmValue = await this.getXlmValue(inheritedXlmValue);
    const price = valueInXlm.price * xlmValue;
    return { token, price };
  }

  async getPoolTvl(
    poolAddress: string,
    inheritedXlmValue?: number,
    inheritedPools?: any[],
  ) {
    const pools = await this.getPools(inheritedPools);
    const xlmValue = await this.getXlmValue(inheritedXlmValue);

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
      parseFloat(pool.reserve0) * token0Price.price * 10 ** -7 +
      parseFloat(pool.reserve1) * token1Price.price * 10 ** -7;
    return { pool: poolAddress, tvl };
  }

  async getPoolShares(poolAddress: string, inheritedPools?: any[]) {
    const pools = await this.getPools(inheritedPools);

    const filteredPools = pools.filter(
      (pool) => pool.contractId == poolAddress,
    );

    if (filteredPools.length === 0) {
      throw new ServiceUnavailableException('Liquidity pool not found');
    }

    const shares = filteredPools[0].totalShares * 10 ** -7;
    return { pool: poolAddress, shares: shares };
  }

  async getSoroswapTvl(inheritedPools?: any[], inheritedXlmValue?: number) {
    const pools = await this.getPools(inheritedPools);
    const xlmValue = await this.getXlmValue(inheritedXlmValue);

    let tvl = 0;
    for (const pool of pools) {
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
      tvl +=
        parseFloat(pool.reserve0) * 10 ** -7 * token0Price.price +
        parseFloat(pool.reserve1) * 10 ** -7 * token1Price.price;
    }
    return tvl;
  }

  async getSoroswapVolume(
    lastNDays: number,
    inheritedPools?: any[],
    inheritedContractEvents?: any[],
    inheritedXlmValue?: number,
  ) {
    const contractEvents = await this.getContractEvents(
      inheritedContractEvents,
    );
    const pools = await this.getPools(inheritedPools);
    const xlmValue = await this.getXlmValue(inheritedXlmValue);

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    let volume = 0;
    for (const event of contractEvents) {
      const timeDiff = now.getTime() - event.closeTime.getTime();
      if (timeDiff < oneDay * lastNDays) {
        if (event.topic2 == 'add' || event.topic2 == 'remove') {
          const tokenPriceA = await this.getTokenPriceInUSD(
            event.token_a,
            xlmValue,
            pools,
          );
          const tokenPriceB = await this.getTokenPriceInUSD(
            event.token_b,
            xlmValue,
            pools,
          );
          volume += parseFloat(event.amount_a) * 10 ** -7 * tokenPriceA.price;
          volume += parseFloat(event.amount_b) * 10 ** -7 * tokenPriceB.price;
        } else if (event.topic2 == 'swap') {
          for (let i = 0; i < event.amounts.length; i++) {
            const tokenPrice = await this.getTokenPriceInUSD(
              event.path[i],
              xlmValue,
              pools,
            );
            volume +=
              parseFloat(event.amounts[i]) * 10 ** -7 * tokenPrice.price;
          }
        }
      }
    }
    return volume;
  }

  async getTokenVolume(
    token: string,
    lastNDays: number,
    inheritedPools?: any[],
    inheritedContractEvents?: any[],
    inheritedXlmValue?: number,
  ) {
    const contractEvents = await this.getContractEvents(
      inheritedContractEvents,
    );
    const pools = await this.getPools(inheritedPools);
    const xlmValue = await this.getXlmValue(inheritedXlmValue);

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    let volume = 0;
    for (const event of contractEvents) {
      const timeDiff = now.getTime() - event.closeTime.getTime();
      if (timeDiff < oneDay * lastNDays) {
        if (event.topic2 == 'add' || event.topic2 == 'remove') {
          if (event.token_a == token) {
            const tokenPrice = await this.getTokenPriceInUSD(
              event.token_a,
              xlmValue,
              pools,
            );
            volume += parseFloat(event.amount_a) * 10 ** -7 * tokenPrice.price;
          } else if (event.token_b == token) {
            const tokenPrice = await this.getTokenPriceInUSD(
              event.token_b,
              xlmValue,
              pools,
            );
            volume += parseFloat(event.amount_b) * 10 ** -7 * tokenPrice.price;
          }
        } else if (event.topic2 == 'swap') {
          for (let i = 0; i < event.amounts.length; i++) {
            if (event.path[i] == token) {
              const tokenPrice = await this.getTokenPriceInUSD(
                event.path[i],
                xlmValue,
                pools,
              );
              volume +=
                parseFloat(event.amounts[i]) * 10 ** -7 * tokenPrice.price;
            }
          }
        }
      }
    }

    return volume;
  }

  async getPoolVolume(
    pool: string,
    lastNDays: number,
    inheritedXlmValue?: number,
    inheritedPools?: any[],
    inheritedContractEvents?: any[],
  ) {
    const contractEvents = await this.getContractEvents(
      inheritedContractEvents,
    );
    const pools = await this.getPools(inheritedPools);
    const xlmValue = await this.getXlmValue(inheritedXlmValue);

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const poolData = pools.find((item) => item.contractId == pool);

    let volume = 0;
    for (const event of contractEvents) {
      const timeDiff = now.getTime() - event.closeTime.getTime();
      if (timeDiff < oneDay * lastNDays && event.pair && event.pair == pool) {
        if (event.topic2 == 'add' || event.topic2 == 'remove') {
          const tokenPriceA = await this.getTokenPriceInUSD(
            event.token_a,
            xlmValue,
            pools,
          );
          const tokenPriceB = await this.getTokenPriceInUSD(
            event.token_b,
            xlmValue,
            pools,
          );
          volume += parseFloat(event.amount_a) * 10 ** -7 * tokenPriceA.price;
          volume += parseFloat(event.amount_b) * 10 ** -7 * tokenPriceB.price;
        } else if (event.topic2 == 'swap') {
          for (let i = 0; i < event.amounts.length; i++) {
            if (
              event.path[i] == poolData.token0 ||
              event.path[i] == poolData.token1
            ) {
              const tokenPrice = await this.getTokenPriceInUSD(
                event.path[i],
                xlmValue,
                pools,
              );
              volume +=
                parseFloat(event.amounts[i]) * 10 ** -7 * tokenPrice.price;
            }
          }
        }
      }
    }
    return volume;
  }

  async getSoroswapFees(
    lastNDays: number,
    inheritedXlmValue?: number,
    inheritedContractEvents?: any[],
  ) {
    const contractEvents = await this.getContractEvents(
      inheritedContractEvents,
    );
    const xlmValue = await this.getXlmValue(inheritedXlmValue);

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    let fees = 0;
    for (const event of contractEvents) {
      const timeDiff = now.getTime() - event.closeTime.getTime();
      if (timeDiff < oneDay * lastNDays) {
        fees += parseFloat(event.fee) * 10 ** -7;
      }
    }
    return fees * xlmValue;
  }

  async getPoolFees(
    pool: string,
    lastNDays: number,
    inheritedXlmValue?: number,
  ) {
    const contractEvents = await this.getContractEvents();
    const xlmValue = await this.getXlmValue(inheritedXlmValue);

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    let fees = 0;
    for (const event of contractEvents) {
      const timeDiff = now.getTime() - event.closeTime.getTime();
      if (timeDiff < oneDay * lastNDays && event.pair && event.pair == pool) {
        fees += parseFloat(event.fee) * 10 ** -7;
      }
    }
    return fees * xlmValue;
  }

  async getPoolInfo(
    poolAddress: string,
    inheritedXlmValue?: number,
    inheritedPools?: any[],
    inheritedContractEvents?: any[],
  ) {
    const contractEvents = await this.getContractEvents(
      inheritedContractEvents,
    );
    const xlmValue = await this.getXlmValue(inheritedXlmValue);
    const pools = await this.getPools(inheritedPools);

    const filteredPools = pools.filter(
      (pool) => pool.contractId === poolAddress,
    );

    const tvl = await this.getPoolTvl(poolAddress, xlmValue, pools);
    const volume24h = await this.getPoolVolume(
      poolAddress,
      1,
      xlmValue,
      pools,
      contractEvents,
    );
    const volume7d = await this.getPoolVolume(
      poolAddress,
      7,
      xlmValue,
      pools,
      contractEvents,
    );
    const fees24h = await this.getPoolFees(poolAddress, 1, xlmValue);
    const feesYearly = await this.getPoolFees(poolAddress, 365, xlmValue);
    const liquidity = await this.getPoolShares(poolAddress, pools);

    const obj = {
      pool: poolAddress,
      token0: filteredPools[0].token0,
      token1: filteredPools[0].token1,
      reserve0: filteredPools[0].reserve0 * 10 ** -7,
      reserve1: filteredPools[0].reserve1 * 10 ** -7,
      tvl: tvl.tvl,
      volume24h: volume24h,
      volume7d: volume7d,
      fees24h: fees24h,
      feesYearly: feesYearly,
      liquidity: liquidity.shares,
    };

    return obj;
  }

  async getPoolsInfo() {
    const contractEvents = await this.getContractEvents();
    const pools = await this.getPools();
    const xlmValue = await this.getXlmValue();

    const poolsInfo = [];
    for (const pool of pools) {
      const poolInfo = await this.getPoolInfo(
        pool.contractId,
        xlmValue,
        pools,
        contractEvents,
      );
      poolsInfo.push(poolInfo);
    }

    return poolsInfo;
  }

  async getTokenInfo(
    token: string,
    inheritedXlmValue?: number,
    inheritedPools?: any[],
    inheritedContractEvents?: any[],
    inheritedTokens?: any[],
  ) {
    const contractEvents = await this.getContractEvents(
      inheritedContractEvents,
    );
    const xlmValue = await this.getXlmValue(inheritedXlmValue);
    const pools = await this.getPools(inheritedPools);

    const tvl = await this.getTokenTvl(token, xlmValue, pools);
    const priceInUsd = await this.getTokenPriceInUSD(token, xlmValue, pools);
    const volume24h = await this.getTokenVolume(
      token,
      1,
      pools,
      contractEvents,
      xlmValue,
    );

    const obj = {
      token: token,
      tvl: tvl.tvl,
      price: priceInUsd.price,
      priceChange24h: 0,
      volume24h: volume24h,
    };

    return obj;
  }

  async getTokensInfo() {
    const contractEvents = await this.getContractEvents();
    const xlmValue = await this.getXlmValue();
    const pools = await this.getPools();

    const { data } = await axiosApiBackendInstance.get('/api/tokens');
    const tokens = data.find((item) => item.network === 'testnet').tokens;

    const tokensInfo = [];
    for (const token of tokens) {
      try {
        const tokenInfo = await this.getTokenInfo(
          token.address,
          xlmValue,
          pools,
          contractEvents,
          data,
        );
        tokensInfo.push(tokenInfo);
      } catch (error) {
        console.error(
          `Error trying to get info for token ${token.address}: ${error}`,
        );
        continue;
      }
    }

    return tokensInfo;
  }
}
