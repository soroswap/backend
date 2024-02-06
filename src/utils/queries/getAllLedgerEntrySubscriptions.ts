import { gql } from 'graphql-request';

export const GET_ALL_LEDGER_ENTRY_SUBSCRIPTIONS = gql`
  query MyQuery {
    allLedgerEntrySubscriptions {
      edges {
        node {
          id
          contractId
          keyXdr
        }
      }
    }
  }
`;
