import { gql } from 'graphql-request';

export const GET_EVENTS_BY_CONTRACT_AND_TOPIC = gql`
  query ContractEventsPagination(
    $contractId: String!
    $t1: String
    $t2: String
    $t3: String
    $t4: String
    $first: Int
    $last: Int
    $offset: Int
    $before: Cursor
    $after: Cursor
  ) {
    eventByContractIdAndTopic(
      searchedContractId: $contractId
      t1: $t1
      t2: $t2
      t3: $t3
      t4: $t4
      first: $first
      last: $last
      offset: $offset
      before: $before
      after: $after
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          data
          topic1
          topic2
          topic3
          topic4
          txInfoByTx {
            ledgerByLedger {
              closeTime
              sequence
            }
            txHash
            opCount
            fee
          }
        }
      }
    }
  }
`;
