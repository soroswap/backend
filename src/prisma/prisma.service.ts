import { PrismaClient } from '.prisma/client';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Network } from '@prisma/client';
import { populateDatabase } from 'src/scripts/populateDatabase';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    await populateDatabase(Network.MAINNET);
    await populateDatabase(Network.TESTNET);
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      return false;
    }
  }
}
