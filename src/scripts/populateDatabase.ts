import { PrismaClient } from '@prisma/client';
import { Mercury } from 'mercury-sdk';
import { getFactoryAddress } from '../utils';
import { GET_ALL_LEDGER_ENTRY_SUBSCRIPTIONS } from '../utils/queries';
import { constants, factoryAddresses } from '../constants';

export async function populateDatabase() {
  const mercuryInstance = new Mercury({
    backendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT,
    graphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT,
    email: process.env.MERCURY_TESTER_EMAIL,
    password: process.env.MERCURY_TESTER_PASSWORD,
  });

  const prisma = new PrismaClient();
  const soroswapFactoryAddress = await getFactoryAddress();

  const ledgerEntrySubscriptions = await mercuryInstance
    .getCustomQuery({ request: GET_ALL_LEDGER_ENTRY_SUBSCRIPTIONS })
    .catch((err: any) => {
      console.log(err);
      throw new Error('Error getting ledger entry subscriptions');
    });

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
        },
        update: {},
        create: {
          contractId: node.contractId,
          keyXdr: node.keyXdr,
          protocol: 'SOROSWAP',
          contractType: 'FACTORY',
          storageType: 'INSTANCE',
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
        },
        update: {},
        create: {
          contractId: node.contractId,
          keyXdr: node.keyXdr,
          protocol: 'PHOENIX',
          contractType: 'FACTORY',
          storageType: 'INSTANCE',
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
        },
        update: {},
        create: {
          contractId: node.contractId,
          keyXdr: node.keyXdr,
          protocol: 'SOROSWAP',
          contractType: 'FACTORY',
          storageType: 'PERSISTENT',
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
        },
        update: {},
        create: {
          contractId: node.contractId,
          keyXdr: node.keyXdr,
          protocol: 'PHOENIX',
          contractType: 'FACTORY',
          storageType: 'PERSISTENT',
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
        },
        update: {},
        create: {
          contractId: node.contractId,
          keyXdr: node.keyXdr,
          protocol: 'PHOENIX',
          contractType: 'FACTORY',
          storageType: 'PERSISTENT',
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
        },
        update: {},
        create: {
          contractId: node.contractId,
          keyXdr: node.keyXdr,
          protocol: 'PHOENIX',
          contractType: 'FACTORY',
          storageType: 'PERSISTENT',
        },
      });

      // Case: Pair Storage
    } else if (
      !factoryAddresses.soroswap.includes(node.contractId) &&
      !factoryAddresses.phoenix.includes(node.contractId) &&
      node.keyXdr === constants.instanceStorageKeyXdr
    ) {
      pairStorage++;
      await prisma.subscriptions.upsert({
        where: {
          contractId_keyXdr: {
            contractId: node.contractId,
            keyXdr: node.keyXdr,
          },
        },
        update: {},
        create: {
          contractId: node.contractId,
          keyXdr: node.keyXdr,
          contractType: 'PAIR',
          storageType: 'INSTANCE',
        },
      });
    } else {
      others++;
    }
  }

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
