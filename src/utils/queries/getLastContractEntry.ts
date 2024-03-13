import { gql } from 'graphql-request';

export const GET_LAST_CONTRACT_ENTRY = gql`
  query MyQuery($contractId: String!, $ledgerKey: String!) {
    entryUpdateByContractIdAndKey(
      contract: $contractId
      ledgerKey: $ledgerKey
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
  }
`;
