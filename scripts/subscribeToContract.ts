import { Mercury } from 'mercury-sdk';

(async function() {
  const mercuryInstance = new Mercury({
    backendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT,
    graphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT,
    email: process.env.MERCURY_TESTER_EMAIL,
    password: process.env.MERCURY_TESTER_PASSWORD,
  });
  
  const contractId = process.env.FACTORY_CONTRACT_ID;
  
  const args = {
    contractId,
    keyXdr: "AAAFA==",
    durability: "persistent"
  }
  
  const subscribeResponse = await mercuryInstance.subscribeToLedgerEntries(args).catch((err) => {
    console.error(err)
  });
  
  console.log(subscribeResponse);
})()

// To run: yarn ts-node scripts/subscribeToContract.ts
