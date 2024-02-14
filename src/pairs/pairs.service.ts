import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Mercury } from 'mercury-sdk';
import * as sdk from 'stellar-sdk';

import { PrismaService } from 'src/prisma/prisma.service';
import { subscribeToLedgerEntriesDto } from './dto/subscribe.dto';

import { getFactoryAddress } from 'src/utils';
import {
  factoryInstanceParser,
  pairAddressesParser,
  pairInstanceParser,
} from 'src/utils/parsers';
import {
  GET_LAST_CONTRACT_ENTRY,
  buildGetPairAddressesQuery,
  buildGetPairWithTokensAndReservesQuery,
} from 'src/utils/queries';
import { constants } from 'src/constants';

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
  getKeyXdrForPair(pairIndex: number) {
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
    let subscribeResponse;
    let args;
    for (let i = first; i < last; i++) {
      key_xdr = this.getKeyXdrForPair(i);

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

        subscribeResponse = await mercuryInstance
          .subscribeToLedgerEntries(args)
          .catch((err) => {
            throw new Error(`Error subscribing to pair ${i}: ${err}`);
          });

        await this.prisma.subscriptions.create({
          data: {
            contractId,
            keyXdr: key_xdr,
            protocol: 'SOROSWAP',
            contractType: 'FACTORY',
            storageType: 'PERSISTENT',
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
  async getPairsCountFromMercury() {
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
  async getPairsCountFromDB() {
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
      const ledgerKey = this.getKeyXdrForPair(i);
      variables[`ledgerKey${i + 1}`] = ledgerKey;
    }

    return variables;
  }

  /**
   * Function to get array with all pair addresses stored in Factory Contract.
   * @returns Array with pair addresses.
   * @throws Error if Mercury request fails.
   */
  async getPairAddresses() {
    const pairCounter = await this.getPairsCountFromMercury();
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
   * @returns Array with pair objects.
   * @throws Error if Mercury request fails.
   */
  async getPairWithTokensAndReserves(addresses: string[]) {
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
        const parsedEntries = pairInstanceParser(mercuryResponse.data);
        return parsedEntries;
      } else {
        throw new Error('Error getting pair addresses');
      }
    } else {
      return [];
    }
  }

  async getAllPools() {
    const newCounter = await this.getPairsCountFromMercury();
    console.log('Pairs count in Mercury:', newCounter);
    const oldCounter = await this.getPairsCountFromDB();
    console.log('Pairs count in db:', oldCounter);
    if (newCounter > oldCounter) {
      console.log('New pairs found');
      await this.subscribeToPairsOnSoroswapFactory(oldCounter, newCounter);
      const addresses = await this.getPairAddresses();
      const newAddresses = addresses.slice(oldCounter, newCounter);
      await this.subscribeToSoroswapPairs({
        contractId: newAddresses,
        keyXdr: constants.instanceStorageKeyXdr,
        durability: 'persistent',
        hydrate: true,
      });
      console.log('Fetching Liquidity pools...');
      const pools = await this.getPairWithTokensAndReserves(addresses);
      console.log('done');
      return pools;
    } else {
      console.log('No new pairs found');
      const addresses = await this.getPairAddresses();
      console.log('Fetching Liquidity pools...');
      const pools = await this.getPairWithTokensAndReserves(addresses);
      console.log('done');
      return pools;
    }
  }
}
