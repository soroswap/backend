import * as StellarSdk from '@stellar/stellar-sdk';
import { scValToJs } from 'mercury-sdk';
import { ContractEntriesResponse } from '../../types';
import { soroswapKeyNames } from './pairInstanceParser';

export interface PairInstanceEntryParserResult {
  protocol: string;
  timestamp: number | null;
  token0: string;
  token1: string;
  reserve0: string;
  reserve1: string;
  totalShares: string;
}

export interface PairInstanceWithEntriesParserResult {
  entries: PairInstanceEntryParserResult[];
  protocol: string;
  timestamp: number | null;
  token0: string;
  token1: string;
  reserve0: string;
  reserve1: string;
  totalShares: string;
  contractId: string;
}

export const soroswapPairInstanceWithEntriesParser = (
  data: ContractEntriesResponse,
) => {
  const parsedEntries: PairInstanceWithEntriesParserResult[] = [];

  let key: keyof typeof data;

  for (key in data) {
    const edges = data[key].edges;
    const contractId = data[key].edges[0].node.contractId;

    let contractData = {
      entries: [],
      contractId,
    } as PairInstanceWithEntriesParserResult;

    edges?.forEach((edge) => {
      const base64Xdr = edge.node.valueXdr;
      const timestamp = edge.node.txInfoByTx?.ledgerByLedger?.closeTime;

      if (!base64Xdr) {
        throw new Error('No valueXdr found in the entry');
      }

      const parsedData: any = StellarSdk.xdr.ScVal.fromXDR(base64Xdr, 'base64');
      const jsValues: any = scValToJs(parsedData);
      const parsedValue = {
        timestamp: timestamp ?? null,
      } as PairInstanceEntryParserResult;

      if (typeof jsValues.storage !== 'undefined') {
        Object.assign(parsedValue, { ['protocol']: 'soroswap' });
        for (let i = 0; i < 4; i++) {
          // We only want the first 4 properties (token0, token1, reserve0, reserve1)
          const element = jsValues.storage()[i].val();
          Object.assign(parsedValue, {
            [soroswapKeyNames[i]]: scValToJs(element),
          });
        }
        Object.assign(parsedValue, {
          ['totalShares']: scValToJs(jsValues.storage()[6].val()),
        });

        contractData.entries.push(parsedValue);
      }
    });

    contractData = {
      ...contractData,
      ...contractData.entries[0],
    };

    parsedEntries.push(contractData);
  }

  return parsedEntries;
};
