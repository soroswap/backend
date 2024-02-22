import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Mercury } from 'mercury-sdk';
import * as sdk from 'stellar-sdk';

import { PrismaService } from 'src/prisma/prisma.service';
import { subscribeToLedgerEntriesDto } from './dto/subscribe.dto';

import { constants } from 'src/constants';
import { getFactoryAddress } from 'src/utils';
import {
  factoryInstanceParser,
  pairAddressesParser,
  phoenixFactoryLpVecParser,
  phoenixPairInstanceParser,
  soroswapPairInstanceParser,
} from 'src/utils/parsers';
import {
  GET_LAST_CONTRACT_ENTRY,
  buildGetPairAddressesQuery,
  buildGetPairWithTokensAndReservesQuery,
} from 'src/utils/queries';

const mercuryInstance = new Mercury({
  backendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT,
  graphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT,
  email: process.env.MERCURY_TESTER_EMAIL,
  password: process.env.MERCURY_TESTER_PASSWORD,
});

@Injectable()
export class PairsService {
  constructor(private prisma: PrismaService) {}

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
   * Subscribes to pairs in the ledger based on the provided data.
   * @param data - The data needed to subscribe to pairs.
   * @returns A promise that resolves to an array of subscribed pairs if multiple contract IDs are provided,
   * or a single subscribed pair if only one contract ID is provided.
   * @throws BadRequestException if the contract ID array is empty, or if either the contract ID or keyXdr is missing.
   */
  async subscribeToSoroswapPairs(data: subscribeToLedgerEntriesDto) {
    if (data.contractId.length === 0 || !data.contractId || !data.keyXdr) {
      throw new BadRequestException('Please double check your request body');
    }

    const response = [];
    let subscribeResponse;
    for (let i = 0; i < data.contractId.length; i++) {
      const subscriptionExists = await this.prisma.subscriptions.findFirst({
        where: {
          contractId: data.contractId[i],
          keyXdr: data.keyXdr,
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
          .catch((err) => {
            throw new Error(`Error subscribing to pair ${i}: ${err}`);
          });

        const subscription = await this.prisma.subscriptions.create({
          data: {
            contractId: data.contractId[i],
            keyXdr: data.keyXdr,
            protocol: 'SOROSWAP',
            contractType: 'PAIR',
            storageType: 'INSTANCE',
          },
        });

        response.push(subscribeResponse);
        console.log('Subscribed to pair', subscription.contractId);
      } else {
        console.log('Subscription already exists for pair with:');
        console.log('contractId:', data.contractId[i]);
        console.log('key_xdr:', data.keyXdr);
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
  async subscribeToPairsOnSoroswapFactory(first: number, last: number) {
    const contractId = await getFactoryAddress();

    let key_xdr;
    let args;
    for (let i = first; i < last; i++) {
      key_xdr = this.getKeyXdrForSoroswapPair(i);

      const subscriptionExists = await this.prisma.subscriptions.findFirst({
        where: {
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

        try {
          console.log(mercuryInstance, 'mercuryInstance');

          const ledgerTest =
            await mercuryInstance.subscribeToLedgerEntries(args);
          console.log('🚀 « ledgerTest:', ledgerTest);

          await this.prisma.subscriptions.create({
            data: {
              contractId,
              keyXdr: key_xdr,
              protocol: 'SOROSWAP',
              contractType: 'FACTORY',
              storageType: 'PERSISTENT',
            },
          });
        } catch (error) {
          console.error('Error subscribing to pair index', error);
        }

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
  async getSoroswapPairsCountFromMercury() {
    const contractId = await getFactoryAddress();
    const mercuryResponse = await mercuryInstance
      .getCustomQuery({
        request: GET_LAST_CONTRACT_ENTRY,
        variables: { contractId, ledgerKey: constants.instanceStorageKeyXdr },
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
  async getSoroswapPairsCountFromDB() {
    const count = await this.prisma.subscriptions.count({
      where: {
        contractId: await getFactoryAddress(),
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
  async createVariablesForPairsAddresses(pairCount: number) {
    const contractId = await getFactoryAddress();

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
  async getSoroswapPairAddresses() {
    const pairCounter = await this.getSoroswapPairsCountFromMercury();
    if (pairCounter > 0) {
      const query = buildGetPairAddressesQuery(pairCounter);
      const variables =
        await this.createVariablesForPairsAddresses(pairCounter);
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
  async getPhoenixPairAddresses(contractId: string) {
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
   * @param contractId The contract ID of the Phoenix pair contract.
   * @returns Array with pair addresses.
   * @throws Error if Mercury request fails.
   */
  async subscribeToPhoenixPair(contractId: string) {
    const keyXdr = constants.instanceStorageKeyXdr;
    const subscriptionExists = await this.prisma.subscriptions.findFirst({
      where: {
        contractId,
        keyXdr,
      },
    });

    if (!subscriptionExists) {
      const args = {
        contractId,
        keyXdr,
        durability: 'persistent',
      };

      await mercuryInstance.subscribeToLedgerEntries(args).catch((err) => {
        console.error(err);
      });

      console.log('Subscribed to Phoenix pair with contract ID', contractId);

      const subscribeStored = await this.prisma.subscriptions.create({
        data: {
          contractId,
          keyXdr,
          protocol: 'PHOENIX',
          contractType: 'PAIR',
          storageType: 'INSTANCE',
        },
      });

      console.log('Subscription stored in db', subscribeStored);
      return subscribeStored;
    } else {
      console.log('Already subscribed to factory contract', contractId);
    }
  }

  /**
   * Function to create object with variables to be used in the Mercury instance query.
   * @param pairCount Number of pairs to be retrieved.
   * @returns Object with the query variables.
   */
  async createVariablesForPairsTokensAndReserves(addresses: string[]) {
    const variables = {};

    for (let i = 0; i < addresses.length; i++) {
      variables[`contractId${i + 1}`] = addresses[i];
    }

    return variables;
  }

  /**
   * Function to get array with all subscribed pairs, along with their tokens and reserves.
   * @param addresses Array with the addresses of the pairs to be retrieved.
   * @returns Array with pair objects.
   * @throws Error if Mercury request fails.
   */
  async getSoroswapPairsWithTokensAndReserves(addresses: string[]) {
    if (addresses.length > 0) {
      const query = buildGetPairWithTokensAndReservesQuery(addresses.length);
      const variables =
        await this.createVariablesForPairsTokensAndReserves(addresses);

      const mercuryResponse = await mercuryInstance
        .getCustomQuery({ request: query, variables })
        .catch((err: any) => {
          console.log(err);
        });

      if (mercuryResponse && mercuryResponse.ok) {
        const parsedEntries = soroswapPairInstanceParser(mercuryResponse.data);
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
  async getPhoenixPairsWithTokensAndReserves(addresses: string[]) {
    if (addresses.length > 0) {
      const query = buildGetPairWithTokensAndReservesQuery(addresses.length);
      const variables =
        await this.createVariablesForPairsTokensAndReserves(addresses);

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
  async checkAndSubscribeToPhoenixPairs(pairAddresses: string[]) {
    if (pairAddresses.length > 0) {
      for (const pairAddress of pairAddresses) {
        const subscriptionExists = await this.prisma.subscriptions.findFirst({
          where: {
            contractId: pairAddress,
            keyXdr: constants.instanceStorageKeyXdr,
          },
        });

        if (!subscriptionExists) {
          console.log('New Phoenix pair found');
          await this.subscribeToPhoenixPair(pairAddress);
        }
      }
    }
  }

  /** Function to get all Phoenix liquidity pools with its details.
   * @returns Array with all Phoenix liquidity pools.
   */
  async getAllPhoenixPools() {
    const phoenixFactories = await this.prisma.subscriptions.findMany({
      where: {
        protocol: 'PHOENIX',
        contractType: 'FACTORY',
        storageType: 'INSTANCE',
      },
    });

    let phoenixPairs = [];
    console.log('Fetching Phoenix Liquidity Pools...');
    for (const factory of phoenixFactories) {
      const pairAddresses = await this.getPhoenixPairAddresses(
        factory.contractId,
      );
      await this.checkAndSubscribeToPhoenixPairs(pairAddresses);
      const pairs =
        await this.getPhoenixPairsWithTokensAndReserves(pairAddresses);
      phoenixPairs = phoenixPairs.concat(pairs);
    }
    console.log(phoenixPairs.length, 'Phoenix pairs\n');
    return phoenixPairs;
  }

  /** Function to get all Soroswap liquidity pools with its details.
   * @returns Array with all Soroswap liquidity pools.
   */
  async getAllSoroswapPools() {
    const newCounter = await this.getSoroswapPairsCountFromMercury();
    const oldCounter = await this.getSoroswapPairsCountFromDB();
    let addresses;
    if (newCounter > oldCounter) {
      console.log('New Soroswap pairs found');
      await this.subscribeToPairsOnSoroswapFactory(oldCounter, newCounter);
      addresses = await this.getSoroswapPairAddresses();
      const newAddresses = addresses.slice(oldCounter, newCounter);
      await this.subscribeToSoroswapPairs({
        contractId: newAddresses,
        keyXdr: constants.instanceStorageKeyXdr,
        durability: 'persistent',
        hydrate: true,
      });
    } else {
      addresses = await this.getSoroswapPairAddresses();
    }
    console.log('Fetching Soroswap Liquidity Pools...');
    const pools = await this.getSoroswapPairsWithTokensAndReserves(addresses);
    console.log(pools.length, 'Soroswap pairs\n');
    return pools;
  }

  /** Function to get all liquidity pools from the specified protocols.
   * @param protocols Array with the protocols to be fetched. If none is provided, all protocols will be fetched.
   * @returns Array with all liquidity pools.
   */
  async getAllPools(protocols: string[]) {
    let allPools = [];
    console.log('Protocols:', protocols);
    if (protocols.includes('soroswap') || protocols.length === 0) {
      const soroswapPools = await this.getAllSoroswapPools();
      allPools = allPools.concat(soroswapPools);
    }
    if (protocols.includes('phoenix') || protocols.length === 0) {
      const phoenixPools = await this.getAllPhoenixPools();
      allPools = allPools.concat(phoenixPools);
    }

    console.log('Done fetching pools');
    return allPools;
  }
}
