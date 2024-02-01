import { getKeyXdrForPair } from "./getKeyXdrForPair";
import { getPairCounter } from "../getPairCounter";
import { getFactoryAddress } from "../getFactoryAddress";
import { Mercury } from "mercury-sdk";
import { PrismaClient } from "@prisma/client";

const mercuryInstance = new Mercury({
  backendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT,
  graphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT,
  email: process.env.MERCURY_TESTER_EMAIL,
  password: process.env.MERCURY_TESTER_PASSWORD,
});

const prismaInstance = new PrismaClient();

/**
 * Function to subscribe to a specific group of pairs from the PairAddressesNIndexed array of a Factory Contract.
 * @param first Index of the first pair of the group.
 * @param last Index of the last pair of the group.
 * @returns Nothing.
 */
export async function subscribeToPairsOnFactory(first: number, last: number) {
  const contractId = await getFactoryAddress();

  let key_xdr;
  let subscribeResponse;
  let args;
  for (let i = first; i < last; i++) {
    key_xdr = getKeyXdrForPair(i);

    let subscriptionExists = await prismaInstance.pairSubscription.findFirst({
      where: {
        contractId,
        keyXdr: key_xdr
      },
    })

    if (!subscriptionExists) {
      console.log("Subscribing to pair", i);
      args = {
        contractId,
        key_xdr,
        durability: "persistent"
      }
      
      subscribeResponse = await mercuryInstance.subscribeToLedgerEntries(args).catch((err) => {
        throw new Error(`Error subscribing to pair ${i}: ${err}`);
      });

      let subscription = await prismaInstance.pairSubscription.create({
        data: {
          contractId,
          keyXdr: key_xdr,
        }
      });

      console.log("Subscription created:", subscription);
      
    } else {
      console.log("Subscription already exists for pair with:");
      console.log("contractId:", contractId);
      console.log("key_xdr:", key_xdr);
    }

  }
};

(async () => {
  const pairCounter = await getPairCounter(mercuryInstance);
  console.log("Pair Counter:", pairCounter);

  await subscribeToPairsOnFactory(0, pairCounter);
})();
