import { gql } from 'graphql-request';

export const GET_CONTRACT_EVENTS = gql`
  query MyQuery($contractId: String!) {
    eventByContractId(searchedContractId: $contractId) {
      edges {
        node {
          contractId
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
            fee
          }
        }
      }
    }
  }
`;
