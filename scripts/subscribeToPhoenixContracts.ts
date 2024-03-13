import { Network, PrismaClient } from '@prisma/client';
import {
  mercuryInstanceMainnet,
  mercuryInstanceTestnet,
} from 'src/services/mercury';
import {
  constants,
  mainnetPhoenixContracts,
  testnetPhoenixContracts,
} from '../src/constants';

const networkInput = process.argv[2]; // 'mainnet' or 'testnet'

// Mapping string input to the Network enum
const networkMap = {
  mainnet: 'MAINNET',
  testnet: 'TESTNET',
};

// Default to TESTNET if the input is not recognized
const network = networkMap[networkInput.toLowerCase()] || 'TESTNET';

(async function () {
  if (!network) throw Error('No network given <testnet | mainnet>');

  const mercuryInstance =
    network == Network.TESTNET
      ? mercuryInstanceTestnet
      : mercuryInstanceMainnet;

  const prisma = new PrismaClient();

  const contractId =
    network == Network.MAINNET
      ? mainnetPhoenixContracts.factory
      : testnetPhoenixContracts.factory;
  console.log('Contract ID:', contractId);

  const keyXdr = process.argv[3].trim();
  console.log('Key XDR:', keyXdr);

  const subscriptionExists = await prisma.subscriptions.findFirst({
    where: {
      contractId,
      keyXdr,
      protocol: 'PHOENIX',
      contractType: 'FACTORY',
      network,
    },
  });

  // console.log('Subscription exists:', subscriptionExists);

  if (!subscriptionExists) {
    const args = {
      contractId,
      keyXdr,
      durability: 'persistent',
    };

    const subscribeResponse = await mercuryInstance
      .subscribeToLedgerEntries(args)
      .catch((err) => {
        console.error(err);
      });

    console.log(subscribeResponse);

    let storageType;
    if (keyXdr === constants.instanceStorageKeyXdr) {
      storageType = 'INSTANCE';
    } else {
      storageType = 'PERSISTENT';
    }

    const subscribeStored = await prisma.subscriptions.create({
      data: {
        contractId,
        keyXdr,
        protocol: 'PHOENIX',
        contractType: 'FACTORY',
        storageType,
        network,
      },
    });

    console.log('Subscription stored in db', subscribeStored);
  } else {
    console.log('Already subscribed to factory contract', contractId);
  }
})();
