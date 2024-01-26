import { Mercury } from 'mercury-sdk';
import getFactoryAddress from './getFactoryAddress';

(async function() {
  const mercuryInstance = new Mercury({
    backendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT,
    graphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT,
    email: process.env.MERCURY_TESTER_EMAIL,
    password: process.env.MERCURY_TESTER_PASSWORD,
  });
  
  const contractId = getFactoryAddress();
  
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
