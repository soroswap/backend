import {
  Inject,
  Injectable,
} from '@nestjs/common';
import axios from 'axios';
import { Cache } from 'cache-manager';
import { PairsService } from 'src/pairs/pairs.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { fetchPathsDto } from './dto/fetchPaths.dto';

@Injectable()
export class UtilsService {
  constructor(
    private prisma: PrismaService,
    private pairsModule: PairsService,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
  ) {}

  async fetchPaths(network: string, body: fetchPathsDto) {
    const { contractId0, contractId1 } = body;

    console.log(body)
    /* const paths = await this.pairsModule.getPaths(
      network,
      contractId0,
      contractId1,
    );

    return paths; */
  }
}
