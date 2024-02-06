import { Mercury } from 'mercury-sdk';
import { PrismaClient } from '@prisma/client';
import { GET_ALL_LEDGER_ENTRY_SUBSCRIPTIONS } from '../src/utils/queries';
import { getFactoryAddress } from '../src/utils';

async function main() {
  const mercuryInstance = new Mercury({
    backendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT,
    graphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT,
    email: process.env.MERCURY_TESTER_EMAIL,
    password: process.env.MERCURY_TESTER_PASSWORD,
  });

  const prisma = new PrismaClient();
  const factoryAddress = await getFactoryAddress();

  const ledgerEntrySubscriptions = await mercuryInstance
    .getCustomQuery({ request: GET_ALL_LEDGER_ENTRY_SUBSCRIPTIONS })
    .catch((err: any) => {
      console.log(err);
      throw new Error('Error getting ledger entry subscriptions');
    });

  let factorySubs = 0;
  let pairSubs = 0;
  let pairIndexSubs = 0;
  let oldFactoryPairSubs = 0;
  for (let sub of ledgerEntrySubscriptions.data.allLedgerEntrySubscriptions
    .edges) {
    let node = sub.node;
    if (node.contractId === factoryAddress && node.keyXdr === 'AAAAFA==') {
      await prisma.factorySubscription.upsert({
        where: {
          contractId: node.contractId,
        },
        update: {},
        create: {
          contractId: node.contractId,
        },
      });
      factorySubs++;
    } else if (
      node.contractId === factoryAddress &&
      node.keyXdr != 'AAAAFA=='
    ) {
      await prisma.factoryPairIndexSubscription.upsert({
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
        },
      });
      pairIndexSubs++;
    } else if (
      node.contractId != factoryAddress &&
      // TODO: manage old Factory subscriptions to not get stored here
      // node.contractId !=
      //   'CBKUBVV5KBJP7Q6I5RRQAEWNQLMWRF6MMRQA7V2C3TPF2USGMSGI77NL' &&
      node.keyXdr === 'AAAAFA=='
    ) {
      await prisma.pairSubscription.upsert({
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
        },
      });
      pairSubs++;
    } else {
      oldFactoryPairSubs++;
    }
  }

  console.log('========== Total subscriptions ==========');
  console.log(
    'DISCLAIMER: \nThere may be several subscriptions for the same factory/pair/index. Only one is stored in the database.\n',
  );
  console.log('   Factory Subscriptions: ', factorySubs);
  console.log('   Pair Subscriptions: ', pairSubs);
  console.log('   Pair Index Subscriptions: ', pairIndexSubs);
  console.log('\nAlso:');
  console.log(oldFactoryPairSubs, 'old Factory Pair Index Subscriptions found');
}

main();
