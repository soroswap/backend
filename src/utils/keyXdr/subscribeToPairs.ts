import { getKeyXdrForPair } from "./getKeyXdrForPair";
import { getPairCounter } from "../getPairCounter";
import { getFactoryAddress } from "../getFactoryAddress";
import { Mercury } from "mercury-sdk";

const mercuryInstance = new Mercury({
  backendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT,
  graphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT,
  email: process.env.MERCURY_TESTER_EMAIL,
  password: process.env.MERCURY_TESTER_PASSWORD,
});
console.log("Mercury Instance:", mercuryInstance);

/**
 * Function to subscribe to a specific group of pairs.
 * @param first Index of the first pair of the group.
 * @param last Index of the last pair of the group.
 * @returns Nothing.
 */
export async function subscribeToPairs(first: number, last: number) {
  const contractId = await getFactoryAddress();
  console.log("Contract ID:", contractId);

  let key_xdr;
  let subscribeResponse;
  let args;
  for (let i = first; i < last; i++) {
    key_xdr = getKeyXdrForPair(i);
    console.log("keyXdr:", key_xdr);

    args = {
      contractId,
      key_xdr,
      durability: "persistent"
    }
    
    subscribeResponse = await mercuryInstance.subscribeToLedgerEntries(args).catch((err) => {
      console.error(err)
    });

    console.log("Subscribe Response:", subscribeResponse);
  }
};

// (async () => {
//   const pairCounter = await getPairCounter(mercuryInstance);
//   console.log("Pair Counter:", pairCounter);

//   await subscribeToPairs(0, pairCounter);
// })();
