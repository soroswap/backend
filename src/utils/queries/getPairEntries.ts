import { gql } from "graphql-request";

/**
 * Function to build a graphql query to retrieve a specific number of pair entries.
 * @param pairCount Number of pair entries to retrieve.
 * @returns The query.
 */
export function buildGetPairEntriesQuery(pairCount: number) {
  let queryBody = '';
  let variables = '$contractId: String!';

  for (let i = 0; i < pairCount; i++) {
    variables += `, $ledgerKey${i + 1}: String!`;
    queryBody += `
      pair${i}: entryUpdateByContractIdAndKey(
        contract: $contractId
        ledgerKey: $ledgerKey${i + 1}
        lastN: 1
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

// Ejemplo de uso
// const queryForTwoPairs = buildGetPairEntriesQuery(3);
// console.log(queryForTwoPairs);
