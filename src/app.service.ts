import { Injectable } from '@nestjs/common';
import { Network } from '@prisma/client';
import { OptimalRouteRequestBodyDto, OptimalRouteResponseDto } from './dto';
import { PrismaService } from './prisma/prisma.service';
import { populateDatabase } from './scripts/populateDatabase';
import { PairsService } from './pairs/pairs.service';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private pairs: PairsService,
  ) {}

  getHealth(): { status: string; time: string; database: string } {
    let dbStatus = 'Disconnected';
    try {
      const isConnected = this.prisma.isConnected();
      dbStatus = isConnected ? 'Connected' : 'Disconnected';
    } catch (error) {
      dbStatus = 'Error connecting to DB';
    }

    return {
      status: 'OK',
      time: new Date().toISOString(),
      database: dbStatus,
    };
  }

  getOptimalRoute(
    network: Network,
    body: OptimalRouteRequestBodyDto,
  ): OptimalRouteResponseDto {
    const { tokenIn, tokenOut } = body;
    return {
      tokenIn,
      tokenOut,
      path: [
        'token_a_address',
        'token_b_address',
        'token_c_address',
        'token_d_address',
        'token_f_address',
      ],
    };
  }

  getAssetInfo(): { message: string } {
    return { message: 'Hello World!' };
  }

  getLastTrades(): { message: string } {
    return { message: 'Hello World!' };
  }

  getInfo(): { message: string } {
    return { message: 'Hello World!' };
  }

  async updateDatabase(network: Network) {
    const addresses = await this.pairs.getSoroswapPairAddresses(network);

    await populateDatabase(network, addresses);
  }
}
