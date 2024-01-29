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
  
  export interface ParsedRouterEntry {
    FeeTo: string;
    FeeToSetter: string;
    AllPairs: string[];
    PairsMapping: PairMapping;
    PairWasmHash: string;
  }
  
  export interface PairMapping {
    pairs: Pair[];
  }  
  
  export interface Pair {
    [pairsAdresses: string]: string;
  }
  