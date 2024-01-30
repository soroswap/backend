import { Mercury } from 'mercury-sdk';
import { getFactoryAddress } from '../src/utils/getFactoryAddress';

(async function() {
  const mercuryInstance = new Mercury({
    backendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT,
    graphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT,
    email: process.env.MERCURY_TESTER_EMAIL,
    password: process.env.MERCURY_TESTER_PASSWORD,
  });

  const keyXdr = process.argv[2];

  if (!keyXdr) {
    console.error("You must provide a keyXdr as an argument.");
    process.exit(1);
  }
  
  const contractId = await getFactoryAddress();
  
  const args = {
    contractId,
    keyXdr,
    durability: "persistent"
  }
  
  const subscribeResponse = await mercuryInstance.subscribeToLedgerEntries(args).catch((err) => {
    console.error(err)
  });
  
  console.log(subscribeResponse);
})()
