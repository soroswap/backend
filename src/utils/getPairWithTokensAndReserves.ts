import { Mercury } from 'mercury-sdk';
import { buildGetPairWithTokensAndReservesQuery } from './queries/getPairWithTokensAndReserves';
import { pairInstanceParser } from './parsers/pairInstanceParser';
import { getPairAddresses } from './getPairAddresses';

/**
 * Function to create object with variables to be used in the Mercury instance query.
 * @param pairCount Number of pairs to be retrieved.
 * @returns Object with the query variables.
 */
async function createVariablesForPairs(addresses: string[]) {
    let variables = {};

    for (let i = 0; i < addresses.length; i++) {
        variables[`contractId${i + 1}`] = addresses[i];
    }

    return variables;
}

/**
 * Function to get array with all subscribed pairs, along with their tokens and reserves.
 * @returns Array with pair objects.
 * @throws Error if Mercury request fails.
 */
export async function getPairWithTokensAndReserves(addresses: string[]) {
    const mercuryInstance = new Mercury({
        backendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT,
        graphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT,
        email: process.env.MERCURY_TESTER_EMAIL,
        password: process.env.MERCURY_TESTER_PASSWORD,
    });

    const query = buildGetPairWithTokensAndReservesQuery(addresses.length);
    const variables = await createVariablesForPairs(addresses);

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

// Usage:
(async () => {
    const pairAddreses = await getPairAddresses();
    const pairs = await getPairWithTokensAndReserves(pairAddreses);
    console.log(pairs);
})();