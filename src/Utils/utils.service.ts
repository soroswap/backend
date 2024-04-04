import {
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  Router,
  Token,
  CurrencyAmount,
  TradeType,
  Networks,
} from "soroswap-router-sdk";
import axios from 'axios';
import { Cache } from 'cache-manager';
import { PairsService } from 'src/pairs/pairs.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { fetchPathsDto } from './dto/fetchPaths.dto';
import { configLoader } from '../config/config-loader';
import { Protocols } from 'src/config/supportedProtocols';

@Injectable()
export class UtilsService {
  constructor(
    private prisma: PrismaService,
    private pairsModule: PairsService,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
  ) {}

  async fetchPaths(network: string, body: fetchPathsDto) {
    console.log('✨fetchPaths');
    console.log('⚠️network', network);
    console.log('⚠️body', body);
    const paths = await this.getPaths(network, body);

    return paths;
  }

  async getPaths(network: string, payload: fetchPathsDto) {
    let currentNetwork = Networks.PUBLIC;
    switch (network) {
      case 'MAINNET':
        currentNetwork = Networks.PUBLIC;
        break;
      case 'TESTNET':
        currentNetwork = Networks.TESTNET;
        break;
      default:
        throw new Error('Invalid network');
    }

    const amount = 10000000;

    const asset0 = new Token(
      currentNetwork,
      payload.contractId0,
      7,
      "XLM",
      "Stellar Lumens"
    );

    const asset1 = new Token(
      currentNetwork,
      payload.contractId1,
      7,
      "XLM",
      "Stellar Lumens"
    );
    
    const router = new Router({
      backendUrl: configLoader().backendURL,
      backendApiKey: configLoader().apiKey,
      pairsCacheInSeconds: 20,
      protocols: [Protocols.SOROSWAP],
      network: currentNetwork,
    });

    const currencyAmount = CurrencyAmount.fromRawAmount(asset1, amount);
    const quoteCurrency = asset0;

    const route = await router.route(
      currencyAmount,
      quoteCurrency,
      TradeType.EXACT_INPUT
    );

    console.log(route.trade.path);
    return route.trade.path;
  }
}
