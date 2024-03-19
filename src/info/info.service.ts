import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Network } from '@prisma/client';
import axios from 'axios';
import { xlmToken } from 'src/constants';
import { PairsService } from 'src/pairs/pairs.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  mercuryInstanceMainnet,
  mercuryInstanceTestnet,
} from 'src/services/mercury';
import { getRouterAddress } from 'src/utils/getRouterAddress';
import { getTokensList } from 'src/utils/getTokensList';
import { getContractEventsParser } from 'src/utils/parsers/getContractEventsParser';
import { GET_CONTRACT_EVENTS } from 'src/utils/queries';

@Injectable()
export class InfoService {
  constructor(
    private prisma: PrismaService,
    private pairs: PairsService,
  ) {}

  async getTokenData(network: Network, token: string) {
    const tokens = await getTokensList(network);
    const currentToken = tokens.find((item) => item.contract === token);
    if (!currentToken) {
      throw new ServiceUnavailableException('Token not found');
    }
    const tokenData = {
      name: currentToken.name,
      symbol: currentToken.code,
      logo: currentToken.icon,
    };
    return tokenData;
  }

  async getPools(network: Network, inheritedPools?: any[]) {
    if (!inheritedPools) {
      return await this.pairs.getAllPools(network, ['soroswap']);
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

  async getContractEvents(network: Network, inheritedContractEvents?: any[]) {
    if (inheritedContractEvents) {
      return inheritedContractEvents;
    }

    const mercuryInstance =
      network == Network.TESTNET
        ? mercuryInstanceTestnet
        : mercuryInstanceMainnet;

    const routerAddress = await getRouterAddress(network);

    const mercuryResponse = await mercuryInstance.getCustomQuery({
      request: GET_CONTRACT_EVENTS,
      variables: { contractId: routerAddress },
    });
    console.log('🚀 « mercuryResponse:', mercuryResponse);

    const parsedContractEvents = getContractEventsParser(mercuryResponse.data!);
    console.log('🚀 « parsedContractEvents:', parsedContractEvents);

    return parsedContractEvents;
  }

  async getTokenTvl(
    network: Network,
    token: string,
    inheritedXlmValue?: number,
    inheritedPools?: any[],
  ) {
    const pools = await this.getPools(network, inheritedPools);

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
      network,
      token,
      inheritedXlmValue,
      pools,
    );
    const tvlInUsd = tvl * tokenPrice.price;
    return { token, tvl: tvlInUsd };
  }

  async getTokenPriceInXLM(
    network: Network,
    token: string,
    inheritedPools?: any[],
  ) {
    const pools = await this.getPools(network, inheritedPools);
    const xlm = xlmToken[network];

    const filteredPools = pools.filter(
      (pool) =>
        (pool.token0 == token && pool.token1 == xlm.contract) ||
        (pool.token0 == xlm.contract && pool.token1 == token),
    );

    if (filteredPools.length === 0) {
      if (token === xlm.contract) {
        return { token, price: 1 };
      }
      console.error(`No liquidity pool for XLM and this token (${token})`);
      return { token, price: 0 };
    }

    const tokenXlmPool = filteredPools[0];
    if (tokenXlmPool.token0 === xlm.contract) {
      const price = tokenXlmPool.reserve0 / tokenXlmPool.reserve1;
      return { token, price };
    } else {
      const price = tokenXlmPool.reserve1 / tokenXlmPool.reserve0;
      return { token, price };
    }
  }

  async getTokenPriceInUSDC(
    network: Network,
    token: string,
    inheritedPools?: any[],
    inheritedTokens?: any[],
  ) {
    const pools = await this.getPools(network, inheritedPools);
    const tokens = await getTokensList(network, inheritedTokens);

    const usdc = tokens.find((item) => item.code === 'USDC');

    const filteredPools = pools.filter(
      (pool) =>
        (pool.token0 == token && pool.token1 == usdc.contract) ||
        (pool.token0 == usdc.contract && pool.token1 == token),
    );

    if (filteredPools.length === 0) {
      throw new ServiceUnavailableException(
        'No liquidity pool for this token and USDC',
      );
    }

    const tokenXlmPool = filteredPools[0];
    if (tokenXlmPool.token0 === usdc.contract) {
      const price = tokenXlmPool.reserve0 / tokenXlmPool.reserve1;
      return { token, price };
    } else {
      const price = tokenXlmPool.reserve1 / tokenXlmPool.reserve0;
      return { token, price };
    }
  }

  async getTokenPriceInUSD(
    network: Network,
    token: string,
    inheritedXlmValue?: number,
    inheritedPools?: any[],
  ) {
    const valueInXlm = await this.getTokenPriceInXLM(
      network,
      token,
      inheritedPools,
    );
    const xlmValue = await this.getXlmValue(inheritedXlmValue);
    const price = valueInXlm.price * xlmValue;
    return { token, price };
  }

  async getPoolTvl(
    network: Network,
    poolAddress: string,
    inheritedXlmValue?: number,
    inheritedPools?: any[],
  ) {
    const pools = await this.getPools(network, inheritedPools);
    const xlmValue = await this.getXlmValue(inheritedXlmValue);

    const filteredPools = pools.filter(
      (pool) => pool.contractId == poolAddress,
    );

    if (filteredPools.length === 0) {
      throw new ServiceUnavailableException('Liquidity pool not found');
    }

    const pool = filteredPools[0];
    const token0Price = await this.getTokenPriceInUSD(
      network,
      pool.token0,
      xlmValue,
      pools,
    );
    const token1Price = await this.getTokenPriceInUSD(
      network,
      pool.token1,
      xlmValue,
      pools,
    );
    const tvl =
      parseFloat(pool.reserve0) * token0Price.price * 10 ** -7 +
      parseFloat(pool.reserve1) * token1Price.price * 10 ** -7;
    return { pool: poolAddress, tvl };
  }

  async getPoolShares(
    network: Network,
    poolAddress: string,
    inheritedPools?: any[],
  ) {
    const pools = await this.getPools(network, inheritedPools);

    const filteredPools = pools.filter(
      (pool) => pool.contractId == poolAddress,
    );

    if (filteredPools.length === 0) {
      throw new ServiceUnavailableException('Liquidity pool not found');
    }

    const shares = filteredPools[0].totalShares * 10 ** -7;
    return { pool: poolAddress, shares: shares };
  }

  async getSoroswapTvl(
    network: Network,
    inheritedPools?: any[],
    inheritedXlmValue?: number,
  ) {
    const pools = await this.getPools(network, inheritedPools);
    const xlmValue = await this.getXlmValue(inheritedXlmValue);
    const variationLast24h = 0.03;
    let tvl = 0;
    for (const pool of pools) {
      const token0Price = await this.getTokenPriceInUSD(
        network,
        pool.token0,
        xlmValue,
        pools,
      );
      const token1Price = await this.getTokenPriceInUSD(
        network,
        pool.token1,
        xlmValue,
        pools,
      );
      tvl +=
        parseFloat(pool.reserve0) * 10 ** -7 * token0Price.price +
        parseFloat(pool.reserve1) * 10 ** -7 * token1Price.price;
    }
    return { tvl: tvl, variation: variationLast24h };
  }

  async getSoroswapVolume(
    network: Network,
    lastNDays: number,
    inheritedPools?: any[],
    inheritedContractEvents?: any[],
    inheritedXlmValue?: number,
  ) {
    const contractEvents = await this.getContractEvents(
      network,
      inheritedContractEvents,
    );
    const pools = await this.getPools(network, inheritedPools);
    const xlmValue = await this.getXlmValue(inheritedXlmValue);

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    let volume = 0;

    const variationLast24h = 0.03;
    for (const event of contractEvents) {
      const timeDiff = now.getTime() - event.closeTime.getTime();
      if (timeDiff < oneDay * lastNDays) {
        if (event.topic2 == 'add' || event.topic2 == 'remove') {
          const tokenPriceA = await this.getTokenPriceInUSD(
            network,
            event.token_a,
            xlmValue,
            pools,
          );
          const tokenPriceB = await this.getTokenPriceInUSD(
            network,
            event.token_b,
            xlmValue,
            pools,
          );
          volume += parseFloat(event.amount_a) * 10 ** -7 * tokenPriceA.price;
          volume += parseFloat(event.amount_b) * 10 ** -7 * tokenPriceB.price;
        } else if (event.topic2 == 'swap') {
          for (let i = 0; i < event.amounts.length; i++) {
            const tokenPrice = await this.getTokenPriceInUSD(
              network,
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
    return { volume: volume, variation: variationLast24h };
  }

  async getTokenVolume(
    network: Network,
    token: string,
    lastNDays: number,
    inheritedPools?: any[],
    inheritedContractEvents?: any[],
    inheritedXlmValue?: number,
  ) {
    const contractEvents = await this.getContractEvents(
      network,
      inheritedContractEvents,
    );
    const pools = await this.getPools(network, inheritedPools);
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
              network,
              event.token_a,
              xlmValue,
              pools,
            );
            volume += parseFloat(event.amount_a) * 10 ** -7 * tokenPrice.price;
          } else if (event.token_b == token) {
            const tokenPrice = await this.getTokenPriceInUSD(
              network,
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
                network,
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
    network: Network,
    pool: string,
    lastNDays: number,
    inheritedXlmValue?: number,
    inheritedPools?: any[],
    inheritedContractEvents?: any[],
  ) {
    const contractEvents = await this.getContractEvents(
      network,
      inheritedContractEvents,
    );
    const pools = await this.getPools(network, inheritedPools);
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
            network,
            event.token_a,
            xlmValue,
            pools,
          );
          const tokenPriceB = await this.getTokenPriceInUSD(
            network,
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
                network,
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
    network: Network,
    lastNDays: number,
    inheritedXlmValue?: number,
    inheritedContractEvents?: any[],
  ) {
    const contractEvents = await this.getContractEvents(
      network,
      inheritedContractEvents,
    );
    console.log('🚀 « contractEvents:', contractEvents);
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
    const variationLast24h = 0.03;
    return { fees: fees * xlmValue, variationLast24h };
  }

  async getPoolFees(
    network: Network,
    pool: string,
    lastNDays: number,
    inheritedXlmValue?: number,
  ) {
    const contractEvents = await this.getContractEvents(network);
    console.log('🚀 « contractEvents:', contractEvents);
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
    network: Network,
    poolAddress: string,
    inheritedXlmValue?: number,
    inheritedPools?: any[],
    inheritedContractEvents?: any[],
  ) {
    const contractEvents = await this.getContractEvents(
      network,
      inheritedContractEvents,
    );
    const xlmValue = await this.getXlmValue(inheritedXlmValue);
    const pools = await this.getPools(network, inheritedPools);

    const filteredPools: any = pools.filter(
      (pool) => pool.contractId === poolAddress,
    );
    if (filteredPools.length === 0) {
      throw new ServiceUnavailableException('Liquidity pool not found');
    }

    const tokenA = await this.getTokenData(network, filteredPools[0].token0);
    const tokenB = await this.getTokenData(network, filteredPools[0].token1);

    const tvl = await this.getPoolTvl(network, poolAddress, xlmValue, pools);
    const volume24h = await this.getPoolVolume(
      network,
      poolAddress,
      1,
      xlmValue,
      pools,
      contractEvents,
    );
    const volume7d = await this.getPoolVolume(
      network,
      poolAddress,
      7,
      xlmValue,
      pools,
      contractEvents,
    );
    const fees24h = await this.getPoolFees(network, poolAddress, 1, xlmValue);
    const feesYearly = await this.getPoolFees(
      network,
      poolAddress,
      365,
      xlmValue,
    );
    const liquidity = await this.getPoolShares(network, poolAddress, pools);

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
      tokenA: tokenA,
      tokenB: tokenB,
    };

    return obj;
  }

  async getPoolsInfo(network: Network) {
    const contractEvents = await this.getContractEvents(network);
    const pools = await this.getPools(network);
    const xlmValue = await this.getXlmValue();

    const poolsInfo = [];
    for (const pool of pools) {
      const poolInfo = await this.getPoolInfo(
        network,
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
    network: Network,
    token: string,
    inheritedXlmValue?: number,
    inheritedPools?: any[],
    inheritedContractEvents?: any[],
  ) {
    const contractEvents = await this.getContractEvents(
      network,
      inheritedContractEvents,
    );
    const xlmValue = await this.getXlmValue(inheritedXlmValue);
    const pools = await this.getPools(network, inheritedPools);

    const tvl = await this.getTokenTvl(network, token, xlmValue, pools);
    const priceInUsd = await this.getTokenPriceInUSD(
      network,
      token,
      xlmValue,
      pools,
    );
    const volume24h = await this.getTokenVolume(
      network,
      token,
      1,
      pools,
      contractEvents,
      xlmValue,
    );
    const volume7d = this.getTokenVolume(
      network,
      token,
      7,
      pools,
      contractEvents,
      xlmValue,
    );
    const priceChange24h = 0;
    const fees24h = 0; // await this.getPoolFees(network)
    const tokenData = await this.getTokenData(network, token);
    const tvlSlippage24h = 0;
    const tvlSlippage7d = 0;

    const obj = {
      fees24h: fees24h,
      token: token,
      name: tokenData.name,
      symbol: tokenData.symbol,
      logo: tokenData.logo,
      tvl: tvl.tvl,
      price: priceInUsd.price,
      priceChange24h: priceChange24h,
      volume7d: volume7d,
      volume24h: volume24h,
      tvlSlippage24h: tvlSlippage24h,
      tvlSlippage7d: tvlSlippage7d,
    };

    return obj;
  }

  async getTokensInfo(network: Network) {
    const contractEvents = await this.getContractEvents(network);
    const xlmValue = await this.getXlmValue();
    const pools = await this.getPools(network);

    const tokens = await getTokensList(network);

    const tokensInfo = [];
    for (const token of tokens) {
      try {
        const tokenInfo = await this.getTokenInfo(
          network,
          token.contract,
          xlmValue,
          pools,
          contractEvents,
        );
        tokensInfo.push(tokenInfo);
      } catch (error) {
        console.error(
          `Error trying to get info for token ${token.code}: ${error}`,
        );
        continue;
      }
    }

    return tokensInfo;
  }
}
