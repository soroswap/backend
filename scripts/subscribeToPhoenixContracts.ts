import { PrismaClient } from '@prisma/client';
import { Mercury } from 'mercury-sdk';
import { constants } from '../src/constants';

(async function () {
  const mercuryInstance = new Mercury({
    backendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT,
    graphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT,
    email: process.env.MERCURY_TESTER_EMAIL,
    password: process.env.MERCURY_TESTER_PASSWORD,
  });

  const prisma = new PrismaClient();

  if (!process.argv[2]) {
    console.error('Contract ID is required');
    process.exit(1);
  }

  if (!process.argv[3]) {
    console.error('Key XDR is required');
    process.exit(1);
  }
  
  const contractId = process.argv[2].trim();
  console.log('Contract ID:', contractId);

  const keyXdr = process.argv[3].trim();
  console.log('Key XDR:', keyXdr);


  let subscriptionExists = await prisma.subscriptions.findFirst({
    where: {
      contractId,
      keyXdr,
      protocol: 'PHOENIX',
      contractType: 'FACTORY',
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
      },
    });

    console.log('Subscription stored in db', subscribeStored);
  } else {
    console.log('Already subscribed to factory contract', contractId);
  }
})();
