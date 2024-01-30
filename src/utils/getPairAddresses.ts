import { buildGetPairEntriesQuery } from './queries/getPairEntries';
import { getPairCounter } from './getPairCounter';
import { getFactoryAddress } from './getFactoryAddress';
import { getKeyXdrForPair } from './keyXdr/getKeyXdrForPair';
import { Mercury } from 'mercury-sdk';
import { pairInstanceParser } from './parsers/getPairEntriesParser';

async function createVariablesForPairs(pairCount: number) {
    const contractId = await getFactoryAddress();

    // Crear el objeto de variables
    let variables = { contractId };

    for (let i = 0; i < pairCount; i++) {
        const ledgerKey = getKeyXdrForPair(i);
        variables[`ledgerKey${i + 1}`] = ledgerKey;
    }

    return variables;
}

export async function getPairAddresses() {
    const mercuryInstance = new Mercury({
        backendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT,
        graphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT,
        email: process.env.MERCURY_TESTER_EMAIL,
        password: process.env.MERCURY_TESTER_PASSWORD,
    });

    const pairCounter = await getPairCounter(mercuryInstance);

    const query = buildGetPairEntriesQuery(pairCounter);
    const variables = await createVariablesForPairs(pairCounter);

    const mercuryResponse = await mercuryInstance.getCustomQuery({ request: query, variables })
    .catch((err: any) => {
        console.log(err)
    });

    if (mercuryResponse && mercuryResponse.ok) {
        const parsedEntries = pairInstanceParser(mercuryResponse.data);
        return parsedEntries;
    } else {
        throw new Error("Error getting pair addresses")
    }

    
};

(async () => {
  const pairAddreses = await getPairAddresses();
  console.log(pairAddreses);
})();