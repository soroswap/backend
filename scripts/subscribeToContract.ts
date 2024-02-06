import { Mercury } from 'mercury-sdk';
import { PrismaClient } from '@prisma/client';
import { getFactoryAddress } from '../src/utils/getFactoryAddress';

(async function () {
  const mercuryInstance = new Mercury({
    backendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT,
    graphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT,
    email: process.env.MERCURY_TESTER_EMAIL,
    password: process.env.MERCURY_TESTER_PASSWORD,
  });

  const prisma = new PrismaClient();

  const keyXdr = 'AAAAFA==';

  const contractId = await getFactoryAddress();

  let subscriptionExists = await prisma.factorySubscription.findFirst({
    where: {
      contractId,
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

    const subscribeStored = await prisma.factorySubscription.create({
      data: {
        contractId,
      },
    });

    console.log('Subscription stored in db', subscribeStored);
  } else {
    console.log('Already subscribed to factory contract', contractId);
  }
})();
