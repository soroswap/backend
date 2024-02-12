import { Mercury } from 'mercury-sdk';
import { PrismaClient } from '@prisma/client';

(async function () {
  const mercuryInstance = new Mercury({
    backendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT,
    graphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT,
    email: process.env.MERCURY_TESTER_EMAIL,
    password: process.env.MERCURY_TESTER_PASSWORD,
  });

  const prisma = new PrismaClient();

  const contractId = process.argv[2];
  console.log('Contract ID:', contractId);

  const keyXdr = process.argv[3];
  console.log('Key XDR:', keyXdr);

  if (!contractId) {
    console.error('Contract ID is required');
    process.exit(1);
  }

  if (!keyXdr) {
    console.error('Key XDR is required');
    process.exit(1);
  }

  // let subscriptionExists = await prisma.factorySubscription.findFirst({
  //   where: {
  //     contractId,
  //   },
  // });

  // console.log('Subscription exists:', subscriptionExists);

  // if (!subscriptionExists) {
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

  // const subscribeStored = await prisma.factorySubscription.create({
  //   data: {
  //     contractId,
  //     protocol: 'phoenix',
  //   },
  // });

  // console.log('Subscription stored in db', subscribeStored);
  // } else {
  //   console.log('Already subscribed to factory contract', contractId);
  // }
})();
