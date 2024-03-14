import { Network, PrismaClient } from '@prisma/client';
import { constants } from '../src/constants';
import {
  mercuryInstanceMainnet,
  mercuryInstanceTestnet,
} from '../src/services/mercury';
import { getFactoryAddress } from '../src/utils';

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

  const keyXdr = constants.instanceStorageKeyXdr;

  const contractId = await getFactoryAddress(network);

  const subscriptionExists = await prisma.subscriptions.findFirst({
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

    const subscribeResponse = await mercuryInstance
      .subscribeToLedgerEntries(args)
      .catch((err) => {
        console.error(err);
      });

    console.log(subscribeResponse);

    const subscribeStored = await prisma.subscriptions.create({
      data: {
        contractId,
        keyXdr,
        protocol: 'SOROSWAP',
        contractType: 'FACTORY',
        storageType: 'INSTANCE',
        network,
      },
    });

    console.log('Subscription stored in db', subscribeStored);
  } else {
    console.log('Already subscribed to factory contract', contractId);
  }
})();
