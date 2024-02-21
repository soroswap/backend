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
    const filteredPools = pools.filter(
      (pool) => pool.token0 == token || pool.token1 == token,
    );
    let tvl = 0;
    console.log('Looking for token', token, 'in Soroswap pools');
    for (const pool of filteredPools) {
      if (pool.token0 == token) {
        console.log('Pool', pool.contractId, 'has', pool.reserve0, token);
        tvl += parseFloat(pool.reserve0);
      } else if (pool.token1 == token) {
        console.log('Pool', pool.contractId, 'has', pool.reserve1, token);
        tvl += parseFloat(pool.reserve1);
      }
    }
    return { token, tvl };
  }

  //   async getTokenPrice(token: string) {
  //     const pools = await this.pairs.getAllPools(['soroswap']);
  //   }
}
