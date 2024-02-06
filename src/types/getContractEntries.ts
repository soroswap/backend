export interface ContractEntriesResponse {
  entryUpdateByContractIdAndKey: ContractEntries;
}

export interface ContractEntries {
  edges: Edge[];
}

export interface Edge {
  node: Node;
}

export interface Node {
  id: string;
  keyXdr: string;
  valueXdr: string;
}

export interface ParsedFactoryInstanceEntry {
  FeeTo: string;
  FeeToSetter: string;
  totalPairs: number;
  FeesEnabled?: boolean;
}
