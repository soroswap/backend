import { gql } from "graphql-request";


/**
 * Function to build a graphql query to retrieve a specific number of pairs with the respective tokens and reserves.
 * @param pairCount Number of pair entries to retrieve.
 * @returns The query.
 */
export function buildGetPairWithTokensAndReservesQuery(pairCount: number) {
  let queryBody = '';
  let variables = '';

  for (let i = 0; i < pairCount; i++) {
    if (i === 0) {
      variables += `$contractId${i + 1}: String!`;
    } else {
      variables += `, $contractId${i + 1}: String!`;
    }
    queryBody += `
      pair${i}: entryUpdateByContractIdAndKey(
        contract: $contractId${i + 1}
        ledgerKey: "AAAAFA=="
      ) {
        edges {
          node {
            id
            keyXdr
            valueXdr
          }
        }
      }
`;
  }

  const query = gql`query MyQuery(${variables}) { ${queryBody} }`;

  return query;
}

// Usage:
// const queryForTwoPairs = buildGetPairWithTokensAndReservesQuery(2);
// console.log(queryForTwoPairs);
