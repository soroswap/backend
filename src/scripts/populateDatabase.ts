/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger } from '@nestjs/common';
import { Network, PrismaClient } from '@prisma/client';
import {
  mercuryInstanceMainnet,
  mercuryInstanceTestnet,
} from 'src/services/mercury';
import { constants, factoryAddresses } from '../constants';
import { getFactoryAddress } from '../utils';
import { GET_ALL_LEDGER_ENTRY_SUBSCRIPTIONS } from '../utils/queries';

export async function populateDatabase(network: Network) {
  Logger.log('Updating database...', `MERCURY ${network}`);

  const mercuryInstance =
    network == Network.TESTNET
      ? mercuryInstanceTestnet
      : mercuryInstanceMainnet;

  const prisma = new PrismaClient();
  const soroswapFactoryAddress = await getFactoryAddress(network);

  const ledgerEntrySubscriptions = await mercuryInstance
    .getCustomQuery({ request: GET_ALL_LEDGER_ENTRY_SUBSCRIPTIONS })
    .catch((err: any) => {
      console.log(err);
      throw new Error('Error getting ledger entry subscriptions');
    });

  if (ledgerEntrySubscriptions.data == null) {
    Logger.log('Database up to date!', `MERCURY ${network}`);
    return;
  }

  let others = 0;
  let soroswapFactoryInstance = 0;
  let phoenixFactoryInstance = 0;
  let soroswapFactoryPersistent = 0;
  let phoenixFactoryConfig = 0;
  let phoenixFactoryLpVec = 0;
  let phoenixFactoryInitialized = 0;
  let pairStorage = 0;

  for (const sub of ledgerEntrySubscriptions.data.allLedgerEntrySubscriptions
    .edges) {
    const node = sub.node;

    // Case: Soroswap Factory instance
    if (
      factoryAddresses.soroswap.includes(node.contractId) &&
      node.keyXdr === constants.instanceStorageKeyXdr
    ) {
      soroswapFactoryInstance++;
      await prisma.subscriptions.upsert({
        where: {
          contractId_keyXdr: {
            contractId: node.contractId,
            keyXdr: node.keyXdr,
          },
          network,
        },
        update: {},
        create: {
          contractId: node.contractId,
          keyXdr: node.keyXdr,
          protocol: 'SOROSWAP',
          contractType: 'FACTORY',
          storageType: 'INSTANCE',
          network,
        },
      });

      // Case: Phoenix Factory instance
    } else if (
      factoryAddresses.phoenix.includes(node.contractId) &&
      node.keyXdr === constants.instanceStorageKeyXdr
    ) {
      phoenixFactoryInstance++;
      await prisma.subscriptions.upsert({
        where: {
          contractId_keyXdr: {
            contractId: node.contractId,
            keyXdr: node.keyXdr,
          },
          network,
        },
        update: {},
        create: {
          contractId: node.contractId,
          keyXdr: node.keyXdr,
          protocol: 'PHOENIX',
          contractType: 'FACTORY',
          storageType: 'INSTANCE',
          network,
        },
      });

      // Case: Soroswap Factory Persistent
    } else if (
      factoryAddresses.soroswap.includes(node.contractId) &&
      node.keyXdr != constants.instanceStorageKeyXdr
    ) {
      soroswapFactoryPersistent++;
      await prisma.subscriptions.upsert({
        where: {
          contractId_keyXdr: {
            contractId: node.contractId,
            keyXdr: node.keyXdr,
          },
          network,
        },
        update: {},
        create: {
          contractId: node.contractId,
          keyXdr: node.keyXdr,
          protocol: 'SOROSWAP',
          contractType: 'FACTORY',
          storageType: 'PERSISTENT',
          network,
        },
      });

      // Case: Phoenix Factory Persistent (Config)
    } else if (
      factoryAddresses.phoenix.includes(node.contractId) &&
      node.keyXdr === constants.phoenixConfigKeyXdr
    ) {
      phoenixFactoryConfig++;
      await prisma.subscriptions.upsert({
        where: {
          contractId_keyXdr: {
            contractId: node.contractId,
            keyXdr: node.keyXdr,
          },
          network,
        },
        update: {},
        create: {
          contractId: node.contractId,
          keyXdr: node.keyXdr,
          protocol: 'PHOENIX',
          contractType: 'FACTORY',
          storageType: 'PERSISTENT',
          network,
        },
      });

      // Case: Phoenix Factory Persistent (LpVec)
    } else if (
      factoryAddresses.phoenix.includes(node.contractId) &&
      node.keyXdr === constants.phoenixLpVecKeyXdr
    ) {
      phoenixFactoryLpVec++;
      await prisma.subscriptions.upsert({
        where: {
          contractId_keyXdr: {
            contractId: node.contractId,
            keyXdr: node.keyXdr,
          },
          network,
        },
        update: {},
        create: {
          contractId: node.contractId,
          keyXdr: node.keyXdr,
          protocol: 'PHOENIX',
          contractType: 'FACTORY',
          storageType: 'PERSISTENT',
          network,
        },
      });

      // Case: Phoenix Factory Persistent (Initialized)
    } else if (
      factoryAddresses.phoenix.includes(node.contractId) &&
      node.keyXdr === constants.phoenixInitializedKeyXdr
    ) {
      phoenixFactoryInitialized++;
      await prisma.subscriptions.upsert({
        where: {
          contractId_keyXdr: {
            contractId: node.contractId,
            keyXdr: node.keyXdr,
          },
          network,
        },
        update: {},
        create: {
          contractId: node.contractId,
          keyXdr: node.keyXdr,
          protocol: 'PHOENIX',
          contractType: 'FACTORY',
          storageType: 'PERSISTENT',
          network,
        },
      });

      // Case: Pair Storage
    } else if (
      !factoryAddresses.soroswap.includes(node.contractId) &&
      !factoryAddresses.phoenix.includes(node.contractId) &&
      node.keyXdr === constants.instanceStorageKeyXdr
    ) {
      pairStorage++;
    } else {
      others++;
    }
  }
  Logger.log('Database up to date!', `MERCURY ${network}`);
  // console.log(
  //   'Soroswap Factory Instance Subscriptions:',
  //   soroswapFactoryInstance,
  // );
  // console.log(
  //   'Phoenix Factory Instance Subscriptions:',
  //   phoenixFactoryInstance,
  // );
  // console.log(
  //   'Soroswap Factory Persistent Subscriptions:',
  //   soroswapFactoryPersistent,
  // );
  // console.log(
  //   'Phoenix Factory Persistent (Config) Subscriptions:',
  //   phoenixFactoryConfig,
  // );
  // console.log(
  //   'Phoenix Factory Persistent (LpVec) Subscriptions:',
  //   phoenixFactoryLpVec,
  // );
  // console.log(
  //   'Phoenix Factory Persistent (Initialized) Subscriptions:',
  //   phoenixFactoryInitialized,
  // );
  // console.log('Pair Storage Subscriptions:', pairStorage);
  // console.log('Other Subscriptions:', others);
}
