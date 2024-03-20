import { Network } from '@prisma/client';
import { Mercury } from 'mercury-sdk';

export const mercuryInstanceTestnet = new Mercury({
  backendEndpoint: process.env.MERCURY_TESTNET_BACKEND_ENDPOINT,
  graphqlEndpoint: process.env.MERCURY_TESTNET_GRAPHQL_ENDPOINT,
  email: process.env.MERCURY_EMAIL,
  password: process.env.MERCURY_PASSWORD,
});

export const mercuryInstanceMainnet = new Mercury({
  backendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT,
  graphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT,
  email: process.env.MERCURY_EMAIL,
  password: process.env.MERCURY_PASSWORD,
});

export const selectMercuryInstance = (network: Network) => {
  return network == Network.TESTNET
    ? mercuryInstanceTestnet
    : mercuryInstanceMainnet;
};
