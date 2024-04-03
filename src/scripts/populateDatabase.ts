/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger } from '@nestjs/common';
import {
  ContractType,
  Network,
  PrismaClient,
  Protocol,
  StorageType,
} from '@prisma/client';
import {
  mercuryInstanceMainnet,
  mercuryInstanceTestnet,
} from 'src/services/mercury';
import { constants, factoryAddresses } from '../constants';
import { GET_ALL_LEDGER_ENTRY_SUBSCRIPTIONS } from '../utils/queries';

export async function populateDatabase(
  network: Network,
  soroswapPairAddresses: string[],
) {
  Logger.log('Updating database...', `MERCURY ${network}`);

  console.log(soroswapPairAddresses);

  const mercuryInstance =
    network == Network.TESTNET
      ? mercuryInstanceTestnet
      : mercuryInstanceMainnet;

  const prisma = new PrismaClient();

  let ledgerEntrySubscriptions = null;

  try {
    ledgerEntrySubscriptions = await mercuryInstance.getCustomQuery({
      request: GET_ALL_LEDGER_ENTRY_SUBSCRIPTIONS,
    });
  } catch (error) {
    Logger.error('Error getting ledger entry subscriptions', error);
    return;
  }

  console.log('🚀 « ledgerEntrySubscriptions:', ledgerEntrySubscriptions);

  if (ledgerEntrySubscriptions.data == null) {
    Logger.log('Database up to date!', `MERCURY ${network}`);
    return;
  }

  const counters: { [x: string]: number } = {
    soroswapFactoryInstance: 0,
    soroswapFactoryPersistent: 0,
    phoenixFactoryInstance: 0,
    phoenixFactoryConfig: 0,
    phoenixFactoryLpVec: 0,
    phoenixFactoryInitialized: 0,
    pairStorage: 0,
    others: 0,
    removedPairs: 0,
  };

  const removedPairs = await prisma.subscriptions.deleteMany({
    where: {
      network,
      contractType: ContractType.PAIR,
      contractId: {
        notIn: soroswapPairAddresses,
      },
    },
  });

  counters.removedPairs = removedPairs.count;

  for (const sub of ledgerEntrySubscriptions.data.allLedgerEntrySubscriptions
    .edges) {
    const node = sub.node;
    const keyXdr = node.keyXdr;
    const contractId = node.contractId;

    console.log('🚀 « node:', node);

    let protocol: Protocol = undefined;
    let contractType: ContractType = undefined;
    let storageType: StorageType = undefined;

    const isSoroswapFactory = factoryAddresses.soroswap.includes(contractId);
    const isPhoenixFactory = factoryAddresses.phoenix.includes(contractId);

    const isInstanceStorage = keyXdr === constants.instanceStorageKeyXdr;

    const isPairStorage =
      !isSoroswapFactory && !isPhoenixFactory && isInstanceStorage;

    if (isSoroswapFactory) {
      protocol = Protocol.SOROSWAP;
      contractType = ContractType.FACTORY;
      if (isInstanceStorage) {
        storageType = StorageType.INSTANCE;
        counters.soroswapFactoryInstance++;
      } else {
        storageType = StorageType.PERSISTENT;
        counters.soroswapFactoryPersistent++;
      }
    }

    if (isPhoenixFactory) {
      protocol = Protocol.PHOENIX;
      contractType = ContractType.FACTORY;
      if (isInstanceStorage) {
        storageType = StorageType.INSTANCE;
        counters.phoenixFactoryInstance++;
      } else {
        storageType = StorageType.PERSISTENT;
        if (keyXdr === constants.phoenixConfigKeyXdr) {
          counters.phoenixFactoryConfig++;
        } else if (keyXdr === constants.phoenixLpVecKeyXdr) {
          counters.phoenixFactoryLpVec++;
        } else if (keyXdr === constants.phoenixInitializedKeyXdr) {
          counters.phoenixFactoryInitialized++;
        }
      }
    }

    if (isPairStorage) {
      contractType = ContractType.PAIR;
      storageType = StorageType.INSTANCE;
      counters.pairStorage++;
    }

    if (!isSoroswapFactory && !isPhoenixFactory && !isPairStorage) {
      counters.others++;
    } else {
      const shouldAdd =
        isSoroswapFactory ||
        isPhoenixFactory ||
        (isPairStorage && soroswapPairAddresses.includes(contractId));

      if (shouldAdd) {
        await prisma.subscriptions.upsert({
          where: {
            contractId_keyXdr: {
              contractId,
              keyXdr,
            },
            network,
          },
          update: {},
          create: {
            contractId,
            keyXdr,
            contractType,
            storageType,
            network,
          },
        });
      }
    }
  }
  Logger.log('Database up to date!', `MERCURY ${network}`);

  console.log({ counters });
}
