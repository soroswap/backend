import { ContractType, Network, PrismaClient, Protocol } from '@prisma/client';
import {
  mercuryInstanceMainnet,
  mercuryInstanceTestnet,
} from '../src/services/mercury';
import { getRouterAddress } from '../src/utils';

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

  const contractId = await getRouterAddress(network);

  const subscriptionExists = await prisma.subscriptions.findFirst({
    where: {
      contractId,
      contractType: ContractType.ROUTER,
      network,
    },
  });

  if (!subscriptionExists) {
    const args = {
      contractId,
    };

    const subscribeResponse = await mercuryInstance
      .subscribeToContractEvents(args)
      .catch((err) => {
        console.error(err);
      });

    console.log(subscribeResponse);

    const subscribeStored = await prisma.subscriptions.create({
      data: {
        contractId,
        protocol: Protocol.SOROSWAP,
        contractType: ContractType.ROUTER,
        network,
      },
    });

    console.log('Subscription stored in db', subscribeStored);
  } else {
    console.log('Already subscribed to router contract', contractId);
  }
})();
