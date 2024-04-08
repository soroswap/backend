import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import * as sdk from '@stellar/stellar-sdk';
import { Cache } from 'cache-manager';

import { PrismaService } from 'src/prisma/prisma.service';
import { subscribeToLedgerEntriesDto } from './dto/subscribe.dto';

import { Network } from '@prisma/client';
import { PredefinedTTL } from 'src/config/predefinedTtl';
import { Protocols } from 'src/config/supportedProtocols';
import { constants } from 'src/constants';
import {
  mercuryInstanceMainnet,
  mercuryInstanceTestnet,
} from 'src/services/mercury';
import { SubscribeToLedgerEntriesInterface } from 'src/types';
import { getFactoryAddress } from 'src/utils';
import { createVariablesForPairsTokensAndReserves } from 'src/utils/createVariablesForPairsTokensAndReserves';
import {
  factoryInstanceParser,
  pairAddressesParser,
  phoenixFactoryLpVecParser,
  phoenixPairInstanceParser,
  soroswapPairInstanceParser,
} from 'src/utils/parsers';
import { soroswapPairInstanceWithEntriesParser } from 'src/utils/parsers/soroswapPairInstanceWithEntriesParser';
import {
  GET_LAST_CONTRACT_ENTRY,
  buildGetPairAddressesQuery,
  buildGetPairWithTokensAndReservesQuery,
} from 'src/utils/queries';

@Injectable()
export class PairsService {
  constructor(
    private prisma: PrismaService,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
  ) {}

  /**
   * Function to get the keyXdr of a specific pair contract.
   * @param pairIndex Index of the pair in the PairAddressesNIndexed attribute of the Factory contract.
   * @returns The keyXdr of the pair as a string.
   */
  getKeyXdrForSoroswapPair(pairIndex: number) {
    const indexScVal = sdk.nativeToScVal(Number(pairIndex), { type: 'u32' });
    const vecScVal = sdk.xdr.ScVal.scvVec([
      sdk.xdr.ScVal.scvSymbol('PairAddressesNIndexed'),
      indexScVal,
    ]);
    const key_xdr = vecScVal.toXDR('base64');

    return key_xdr;
  }

  /**
   * Subscribes to pair ledger entries and events on mercury, based on the provided data.
   * @param data - The data needed to subscribe to pairs.
   * @returns A promise that resolves to an array of subscribed pairs if multiple contract IDs are provided,
   * or a single subscribed pair if only one contract ID is provided.
   * @throws BadRequestException if the contract ID array is empty, or if either the contract ID or keyXdr is missing.
   */
  async subscribeToSoroswapPairs(
    network: Network,
    data: subscribeToLedgerEntriesDto,
  ) {
    if (data.contractId.length === 0 || !data.contractId || !data.keyXdr) {
      throw new BadRequestException('Please double check your request body');
    }

    const mercuryInstance =
      network == Network.TESTNET
        ? mercuryInstanceTestnet
        : mercuryInstanceMainnet;

    const response = [];
    let subscribeResponse;
    let eventSubscribeResponse;
    for (let i = 0; i < data.contractId.length; i++) {
      const subscriptionExists = await this.prisma.subscriptions.findFirst({
        where: {
          network,
          contractId: data.contractId[i],
          keyXdr: data.keyXdr,
        },
      });

      const eventSubscriptionExists =
        await this.prisma.eventSubscriptions.findFirst({
          where: {
            network,
            contractId: data.contractId[i],
          },
        });

      if (!subscriptionExists) {
        const args = {
          contractId: data.contractId[i],
          keyXdr: data.keyXdr,
          durability: data.durability,
          hydrate: data.hydrate,
        };

        subscribeResponse = await mercuryInstance
          .subscribeToLedgerEntries(args)
          .then((response) => {
            if (!(response as SubscribeToLedgerEntriesInterface).ok) {
              throw new Error(
                `Error subscribing to pair ${i}: ${(response as SubscribeToLedgerEntriesInterface).error}`,
              );
            }
          });

        const subscription = await this.prisma.subscriptions.create({
          data: {
            contractId: data.contractId[i],
            keyXdr: data.keyXdr,
            protocol: 'SOROSWAP',
            contractType: 'PAIR',
            storageType: 'INSTANCE',
            network,
          },
        });

        response.push(subscribeResponse);
        console.log('Subscribed to pair', subscription.contractId);
      } else {
        console.log('Subscription already exists for pair with:');
        console.log('contractId:', data.contractId[i]);
        console.log('key_xdr:', data.keyXdr);
      }

      if (!eventSubscriptionExists) {
        const args = {
          contractId: data.contractId[i],
        };

        eventSubscribeResponse = await mercuryInstance
          .subscribeToContractEvents(args)
          .then((response) => {
            if (!(response as SubscribeToLedgerEntriesInterface).ok) {
              throw new Error(
                `Error subscribing to events of pair ${i}: ${(response as SubscribeToLedgerEntriesInterface).error}`,
              );
            }
          });

        const eventSubscription = await this.prisma.eventSubscriptions.create({
          data: {
            contractId: data.contractId[i],
            network,
          },
        });

        response.push(eventSubscribeResponse);
        console.log(
          'Subscribed to events of pair',
          eventSubscription.contractId,
        );
      } else {
        console.log('Subscription already exists for events of pair with:');
        console.log('contractId:', data.contractId[i]);
      }
    }
    return response;
  }

  /**
   * Function to subscribe to a specific group of pairs from the PairAddressesNIndexed array of a Factory Contract.
   * @param first Index of the first pair of the group.
   * @param last Index of the last pair of the group.
   * @returns Nothing.
   */
  async subscribeToPairsOnSoroswapFactory(
    network: Network,
    first: number,
    last: number,
  ) {
    const contractId = await getFactoryAddress(network);

    const mercuryInstance =
      network == Network.TESTNET
        ? mercuryInstanceTestnet
        : mercuryInstanceMainnet;

    let key_xdr;
    let args;
    for (let i = first; i < last; i++) {
      key_xdr = this.getKeyXdrForSoroswapPair(i);

      const subscriptionExists = await this.prisma.subscriptions.findFirst({
        where: {
          network,
          contractId,
          keyXdr: key_xdr,
        },
      });

      if (!subscriptionExists) {
        args = {
          contractId,
          key_xdr,
          durability: 'persistent',
        };

        await mercuryInstance
          .subscribeToLedgerEntries(args)
          .then((response) => {
            if (!(response as SubscribeToLedgerEntriesInterface).ok) {
              throw new Error(
                `Error subscribing to factory for pair index ${i}: ${(response as SubscribeToLedgerEntriesInterface).error}`,
              );
            }
          });

        await this.prisma.subscriptions.create({
          data: {
            contractId,
            keyXdr: key_xdr,
            protocol: 'SOROSWAP',
            contractType: 'FACTORY',
            storageType: 'PERSISTENT',
            network,
          },
        });

        console.log('Subscribed to pair index', i);
      } else {
        console.log('Subscription already exists for pair index:', i);
      }
    }
  }

  /**
   * Function to get the total number of pairs created by the factory.
   * @param mercuryInstance The Mercury instance to be used to make the request.
   * @returns The total number of pairs created by the factory.
   */
  async getSoroswapPairsCountFromMercury(network: Network) {
    const contractId = await getFactoryAddress(network);

    const mercuryInstance =
      network == Network.TESTNET
        ? mercuryInstanceTestnet
        : mercuryInstanceMainnet;

    const mercuryResponse = await mercuryInstance
      .getCustomQuery({
        request: GET_LAST_CONTRACT_ENTRY,
        variables: {
          contractId,
          ledgerKey: constants.instanceStorageKeyXdr,
        },
      })
      .catch((err: any) => {
        console.log(err);
        throw new ServiceUnavailableException('Error getting pair counter');
      });

    if (mercuryResponse && mercuryResponse.ok) {
      const parsedEntry = factoryInstanceParser(mercuryResponse.data);
      if (parsedEntry.length === 0) {
        return 0;
      }
      return parsedEntry[0].totalPairs;
    } else {
      throw new ServiceUnavailableException('Error getting pair counter');
    }
  }

  /**
   * Retrieves the count of Mercury pairs.
   * @returns The count of Mercury pairs.
   */
  async getSoroswapPairsCountFromDB(network: Network) {
    const count = await this.prisma.subscriptions.count({
      where: {
        network,
        contractId: await getFactoryAddress(network),
        protocol: 'SOROSWAP',
        contractType: 'FACTORY',
        storageType: 'PERSISTENT',
      },
    });

    return count;
  }

  /**
   * Function to create object with variables to be used in the Mercury instance query.
   * @param pairCount Number of pairs to be retrieved.
   * @returns Object with the query variables.
   */
  async createVariablesForPairsAddresses(network: Network, pairCount: number) {
    const contractId = await getFactoryAddress(network);

    const variables = { contractId };

    for (let i = 0; i < pairCount; i++) {
      const ledgerKey = this.getKeyXdrForSoroswapPair(i);
      variables[`ledgerKey${i + 1}`] = ledgerKey;
    }

    return variables;
  }

  /**
   * Function to get array with all pair addresses stored in Factory Contract.
   * @returns Array with pair addresses.
   * @throws Error if Mercury request fails.
   */
  async getSoroswapPairAddresses(network: Network) {
    const pairCounter = await this.getSoroswapPairsCountFromMercury(network);

    const mercuryInstance =
      network == Network.TESTNET
        ? mercuryInstanceTestnet
        : mercuryInstanceMainnet;

    if (pairCounter > 0) {
      const query = buildGetPairAddressesQuery(pairCounter);
      const variables = await this.createVariablesForPairsAddresses(
        network,
        pairCounter,
      );
      const mercuryResponse = await mercuryInstance
        .getCustomQuery({ request: query, variables })
        .catch((err: any) => {
          console.log(err);
        });
      if (mercuryResponse && mercuryResponse.ok) {
        const parsedEntries = pairAddressesParser(mercuryResponse.data);
        return parsedEntries;
      } else {
        throw new Error('Error getting pair addresses');
      }
    } else {
      return [];
    }
  }

  /**
   * Function to get array with the addresses of al pairs created by the Phoenix Factory Contract.
   * @param contractId The contract ID of the Phoenix Factory Contract.
   * @returns Array with pair addresses.
   * @throws Error if Mercury request fails.
   */
  async getPhoenixPairAddresses(network: Network, contractId: string) {
    const mercuryInstance =
      network == Network.TESTNET
        ? mercuryInstanceTestnet
        : mercuryInstanceMainnet;

    const mercuryResponse = await mercuryInstance
      .getCustomQuery({
        request: GET_LAST_CONTRACT_ENTRY,
        variables: { contractId, ledgerKey: constants.phoenixLpVecKeyXdr },
      })
      .catch((err: any) => {
        console.log(err);
        throw new ServiceUnavailableException(
          'Error getting Phoenix pairs addresses',
        );
      });
    if (mercuryResponse && mercuryResponse.ok) {
      const pasedLpVec = phoenixFactoryLpVecParser(mercuryResponse.data);
      if (pasedLpVec.length === 0) {
        return 0;
      }
      return pasedLpVec;
    } else {
      throw new ServiceUnavailableException(
        'Error getting Phoenix pairs addresses',
      );
    }
  }

  /**
   * Function to get subscribe to a specific Phoenix pair contract.
   * @param network The network of the blockchain.
   * @param contractId The contract ID of the Phoenix pair contract.
   * @returns Array with pair addresses.
   * @throws Error if Mercury request fails.
   */
  async subscribeToPhoenixPair(network: Network, contractId: string) {
    const mercuryInstance =
      network == Network.TESTNET
        ? mercuryInstanceTestnet
        : mercuryInstanceMainnet;

    const keyXdr = constants.instanceStorageKeyXdr;
    const subscriptionExists = await this.prisma.subscriptions.findFirst({
      where: {
        network,
        contractId,
        keyXdr,
      },
    });

    const eventSubscriptionExists =
      await this.prisma.eventSubscriptions.findFirst({
        where: {
          network,
          contractId,
        },
      });

    if (!subscriptionExists) {
      const args = {
        contractId,
        keyXdr,
        durability: 'persistent',
      };

      await mercuryInstance.subscribeToLedgerEntries(args).then((response) => {
        if (!(response as SubscribeToLedgerEntriesInterface).ok) {
          throw new Error(
            `Error subscribing to phoenix pair: ${(response as SubscribeToLedgerEntriesInterface).error}`,
          );
        }
      });

      console.log('Subscribed to Phoenix pair with contract ID', contractId);

      const subscribeStored = await this.prisma.subscriptions.create({
        data: {
          contractId,
          keyXdr,
          protocol: 'PHOENIX',
          contractType: 'PAIR',
          storageType: 'INSTANCE',
          network,
        },
      });

      console.log('Subscription stored in db', subscribeStored);
    } else {
      console.log('Already subscribed to factory contract', contractId);
    }

    if (!eventSubscriptionExists) {
      const args = {
        contractId,
      };

      await mercuryInstance.subscribeToContractEvents(args).then((response) => {
        if (!(response as SubscribeToLedgerEntriesInterface).ok) {
          throw new Error(
            `Error subscribing to events of phoenix pair: ${(response as SubscribeToLedgerEntriesInterface).error}`,
          );
        }
      });

      console.log(
        'Subscribed to events of Phoenix pair with contract ID',
        contractId,
      );

      const eventSubscribeStored = await this.prisma.eventSubscriptions.create({
        data: {
          contractId,
          network,
        },
      });

      console.log('Subscription stored in db', eventSubscribeStored);
    } else {
      console.log('Already subscribed to factory contract', contractId);
    }
  }

  /**
   * Function to get array with all subscribed pairs, along with their tokens and reserves.
   * @param addresses Array with the addresses of the pairs to be retrieved.
   * @returns Array with pair objects.
   * @throws Error if Mercury request fails.
   */

  async getSoroswapPairsWithTokensAndReserves(
    network: Network,
    addresses: string[],
    withEntries: boolean,
  ) {
    const mercuryInstance =
      network == Network.TESTNET
        ? mercuryInstanceTestnet
        : mercuryInstanceMainnet;

    if (addresses.length > 0) {
      const query = buildGetPairWithTokensAndReservesQuery(addresses.length);
      const variables = createVariablesForPairsTokensAndReserves(addresses);

      const mercuryResponse = await mercuryInstance
        .getCustomQuery({ request: query, variables })
        .catch((err: any) => {
          console.log(err);
        });

      if (mercuryResponse && mercuryResponse.ok) {
        const parser = withEntries
          ? soroswapPairInstanceWithEntriesParser
          : soroswapPairInstanceParser;

        const parsedEntries = parser(mercuryResponse.data);

        return parsedEntries;
      } else {
        throw new Error('Error getting pairs');
      }
    } else {
      return [];
    }
  }

  /**
   * Function to get array with all subscribed Phoenix pairs, along with their tokens and reserves.
   * @param addresses Array with the addresses of the pairs to be retrieved.
   * @returns Array with pair objects.
   * @throws Error if Mercury request fails.
   */
  async getPhoenixPairsWithTokensAndReserves(
    network: Network,
    addresses: string[],
  ) {
    const mercuryInstance =
      network == Network.TESTNET
        ? mercuryInstanceTestnet
        : mercuryInstanceMainnet;

    if (addresses.length > 0) {
      const query = buildGetPairWithTokensAndReservesQuery(addresses.length);
      const variables = createVariablesForPairsTokensAndReserves(addresses);

      const mercuryResponse = await mercuryInstance
        .getCustomQuery({ request: query, variables })
        .catch((err: any) => {
          console.log(err);
        });

      if (mercuryResponse && mercuryResponse.ok) {
        const parsedEntries = phoenixPairInstanceParser(mercuryResponse.data);
        return parsedEntries;
      } else {
        throw new Error('Error getting pairs');
      }
    } else {
      return [];
    }
  }

  /**
   * Function to check if a pair is already subscribed to and, if not, subscribe to it.
   * @param pairAddresses Array with the addresses of the pairs to be checked.
   * @returns Nothing.
   */
  async checkAndSubscribeToPhoenixPairs(
    network: Network,
    pairAddresses: string[],
  ) {
    if (pairAddresses.length > 0) {
      for (const pairAddress of pairAddresses) {
        const subscriptionExists = await this.prisma.subscriptions.findFirst({
          where: {
            network,
            contractId: pairAddress,
            keyXdr: constants.instanceStorageKeyXdr,
          },
        });

        const eventSubscriptionExists =
          await this.prisma.eventSubscriptions.findFirst({
            where: {
              network,
              contractId: pairAddress,
            },
          });

        if (!subscriptionExists || !eventSubscriptionExists) {
          console.log('New Phoenix pair found');
          await this.subscribeToPhoenixPair(network, pairAddress);
        }
      }
    }
  }

  /** Function to get all Phoenix liquidity pools with its details.
   * @returns Array with all Phoenix liquidity pools.
   */
  async getAllPhoenixPools(network: Network) {
    const phoenixFactories = await this.prisma.subscriptions.findMany({
      where: {
        network,
        protocol: 'PHOENIX',
        contractType: 'FACTORY',
        storageType: 'INSTANCE',
      },
    });

    let phoenixPairs = [];
    console.log('Fetching Phoenix Liquidity Pools...');
    for (const factory of phoenixFactories) {
      const pairAddresses = await this.getPhoenixPairAddresses(
        network,
        factory.contractId,
      );
      await this.checkAndSubscribeToPhoenixPairs(network, pairAddresses);
      const pairs = await this.getPhoenixPairsWithTokensAndReserves(
        network,
        pairAddresses,
      );
      phoenixPairs = phoenixPairs.concat(pairs);
    }
    console.log(phoenixPairs.length, 'Phoenix pairs\n');
    return phoenixPairs;
  }

  /** Function to get all Soroswap liquidity pools with its details.
   * @returns Array with all Soroswap liquidity pools.
   */
  async getAllSoroswapPools(network: Network, withEntries = false) {
    const newCounter = await this.getSoroswapPairsCountFromMercury(network);
    console.log('🚀 « newCounter:', newCounter);
    const oldCounter = await this.getSoroswapPairsCountFromDB(network);
    console.log('🚀 « oldCounter:', oldCounter);
    let addresses;
    if (newCounter > oldCounter) {
      console.log('New Soroswap pairs found');
      await this.subscribeToPairsOnSoroswapFactory(
        network,
        oldCounter,
        newCounter,
      );
      addresses = await this.getSoroswapPairAddresses(network);
      const newAddresses = addresses.slice(oldCounter, newCounter);
      await this.subscribeToSoroswapPairs(network, {
        contractId: newAddresses,
        keyXdr: constants.instanceStorageKeyXdr,
        durability: 'persistent',
        hydrate: true,
      });
    } else {
      addresses = await this.getSoroswapPairAddresses(network);
    }
    console.log('Fetching Soroswap Liquidity Pools...');
    const pools = await this.getSoroswapPairsWithTokensAndReserves(
      network,
      addresses,
      withEntries,
    );
    console.log(pools.length, 'Soroswap pairs\n');
    return pools;
  }

  /** Function to get all liquidity pools from the specified protocols.
   * @param protocols Array with the protocols to be fetched. If none is provided, all protocols will be fetched.
   * @returns Array with all liquidity pools.
   */
  async getAllPools(network: Network, protocols: string[]) {
    let keys = []
    for(let protocol in Protocols){
      const protocolNameInUpperCase = protocol.toUpperCase();
      const key = `${network}-${protocolNameInUpperCase}-LIQUIDITY-POOLS`;
      keys.push(key);
    }
    let allPools = [];

    const cachedPools = []
    for(let key in keys){
      const cachedPoolsFromProtocol = await this.cacheManager.get(key);
      cachedPools.push(cachedPoolsFromProtocol);
    }
    if (cachedPools.length > 0) {
      console.log('Returning cached pools');
      return cachedPools;
    } else {
      console.log('No cached pools found');
      console.log('Protocols:', protocols);
      if (protocols.includes('soroswap') || protocols.length === 0) {
        const soroswapPools = await this.getAllSoroswapPools(network);
        allPools = allPools.concat(soroswapPools);
        const protocolKey = `${network}-SOROSWAP-LIQUIDITY-POOLS`;
        await this.cacheManager.set(protocolKey, allPools, PredefinedTTL.OneMinute);
      }
      if (protocols.includes('phoenix') || protocols.length === 0) {
        const phoenixPools = await this.getAllPhoenixPools(network);
        allPools = allPools.concat(phoenixPools);
        const protocolKey = `${network}-PHOENIX-LIQUIDITY-POOLS`;
        await this.cacheManager.set(protocolKey, allPools, PredefinedTTL.OneMinute);
      }
      console.log('Done fetching pools');
      return allPools;
    }
  }
}
