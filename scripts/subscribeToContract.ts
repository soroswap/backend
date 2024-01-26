import { Mercury } from 'mercury-sdk';
import axios from "axios";

(async function() {
  const mercuryInstance = new Mercury({
    backendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT,
    graphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT,
    email: process.env.MERCURY_TESTER_EMAIL,
    password: process.env.MERCURY_TESTER_PASSWORD,
  });
  
  const { data } = await axios.get('https://api.soroswap.finance/api/factory');
  const testnetData = data.find(item => item.network === 'testnet');
  const contractId = testnetData.factory_address;
  
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
