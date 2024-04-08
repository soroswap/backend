import { ContractType, PrismaClient } from '@prisma/client';
import { selectMercuryInstance } from '../src/services/mercury';
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
  const mercuryInstance = selectMercuryInstance(network);

  const prisma = new PrismaClient();

  // Get pair addresses
  const pairs = await prisma.subscriptions.findMany({
    where: {
      contractType: ContractType.PAIR,
      network,
    },
  });

  for (const pair of pairs) {
    const contractId = pair.contractId;
    const subscriptionExists = await prisma.eventSubscriptions.findFirst({
      where: {
        contractId,
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

      const subscribeStored = await prisma.eventSubscriptions.create({
        data: {
          contractId,
          network,
        },
      });

      console.log('Subscription stored in db', subscribeStored);
    } else {
      console.log('Already subscribed to pair contract', contractId);
    }
  }
})();
