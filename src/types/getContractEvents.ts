export interface GetContractEventsResponse {
  eventByContractIdAndTopic?: EventByContractID;
  eventByContractId?: EventByContractID;
}

export interface EventByContractID {
  totalCount?: number;
  pageInfo?: PageInfo;
  edges: Edge[];
}

export interface Edge {
  cursor?: string;
  node: Node;
}

export interface Node {
  contractId?: string;
  data: string;
  topic1: string;
  topic2: string;
  topic3: string;
  topic4: string;
  txInfoByTx: TxInfoByTx;
}

export interface TxInfoByTx {
  ledgerByLedger: LedgerByLedger;
  txHash?: string;
  fee: number;
}

export interface LedgerByLedger {
  closeTime: Date;
  sequence: number;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
}
