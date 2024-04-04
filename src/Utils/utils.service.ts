import {
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  Router,
  Token,
  CurrencyAmount,
  TradeType,
} from "soroswap-router-sdk";
import * as stellarSdk from 'stellar-sdk';
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
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
  ) {}

  async fetchPaths(network: string, body: fetchPathsDto) {
    const paths = await this.getPaths(network, body);

    return paths;
  }

  async getPaths(network: string, payload: fetchPathsDto) {
    let currentNetwork = stellarSdk.Networks.TESTNET;
    switch (network) {
      case 'MAINNET':
        currentNetwork = stellarSdk.Networks.PUBLIC;
        break;
      case 'TESTNET':
        currentNetwork = stellarSdk.Networks.TESTNET;
        break;
      default:
        throw new Error('Invalid network');
    }

    const amount = 1000000;
 
     const asset0 = new Token(
      currentNetwork,
      payload.asset0.contract,
      payload.asset0.decimals,
      payload.asset0.code,
      payload.asset0.name
    );

    const asset1 = new Token(
      currentNetwork,
      payload.asset1.contract,
      payload.asset1.decimals,
      payload.asset1.code,
      payload.asset1.name
    );

    const router = new Router({
      backendUrl: 'http://localhost:4000', //https:api.soroswap.finance/
      backendApiKey: configLoader().apiKey, //cualquiercosa
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
