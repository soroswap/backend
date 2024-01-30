import { gql } from "graphql-request";

export function buildGetPairEntriesQuery(pairCount: number) {
  let queryBody = '';
  let variables = '$contractId: String!';

  for (let i = 0; i < pairCount; i++) {
    variables += `, $ledgerKey${i + 1}: String!`;
    queryBody += `
      pair${pairCount - i - 1}: entryUpdateByContractIdAndKey(
        contract: $contractId
        ledgerKey: $ledgerKey${i + 1}
        lastN: 1
      ) {
        edges {
          node {
            id
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
