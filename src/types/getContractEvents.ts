export interface GetContractEventsResponse {
  eventByContractId: EventByContractID;
}

export interface EventByContractID {
  edges: Edge[];
}

export interface Edge {
  node: Node;
}

export interface Node {
  contractId: string;
  data: string;
  topic2: string;
  topic1: string;
  topic4: string;
  topic3: string;
  txInfoByTx: TxInfoByTx;
}

export interface TxInfoByTx {
  ledgerByLedger: LedgerByLedger;
  fee: number;
}

export interface LedgerByLedger {
  closeTime: Date;
  sequence: number;
}
