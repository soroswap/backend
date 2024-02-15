import { ContractEntriesResponse } from '../../types';
import { scValToJs } from 'mercury-sdk';
import * as StellarSdk from '@stellar/stellar-sdk';

/**
 * Enum representing the key names for pair instance properties.
 */
enum soroswapKeyNames {
  token0 = 0, // address public token0;
  token1 = 1, // address public token1;
  reserve0 = 2, // uint112 private reserve0;
  reserve1 = 3, // uint112 private reserve1;
  factoryAddress = 4, // address public factory;
  totalShares = 5, // TotalShares;
  pairToken = 6, // liquidity pool token:
  pairAddress = 7, // PairAddress;
}

/**
 * Parses the contract entries response and returns an array of parsed pair entries.
 * @param data The contract entries response object.
 * @returns An array of parsed pair entries.
 * @throws Error if no entries are provided or if no valueXdr is found in an entry.
 */
export const soroswapPairInstanceParser = (data: ContractEntriesResponse) => {
  const parsedEntries: any[] = [];

  let key: keyof typeof data;
  for (key in data) {
    const base64Xdr = data[key].edges[0].node.valueXdr;
    const contractId = data[key].edges[0].node.contractId;
    if (!base64Xdr) {
      throw new Error('No valueXdr found in the entry');
    }

    const parsedData: any = StellarSdk.xdr.ScVal.fromXDR(base64Xdr, 'base64');
    const jsValues: any = scValToJs(parsedData);
    const parsedValue = {};
    if (typeof jsValues.storage !== 'undefined') {
      Object.assign(parsedValue, { ['contractId']: contractId });
      for (let i = 0; i < 4; i++) {
        // We only want the first 4 properties (token0, token1, reserve0, reserve1)
        const element = jsValues.storage()[i].val();
        Object.assign(parsedValue, {
          [soroswapKeyNames[i]]: scValToJs(element),
        });
      }
      parsedEntries.push(parsedValue);
      // parsedEntries[contractId] = parsedValue;
    }
  }
  return parsedEntries;
};

export const phoenixPairInstanceParser = (data: ContractEntriesResponse) => {
  const parsedEntries: any[] = [];

  let key: keyof typeof data;
  for (key in data) {
    const base64Xdr = data[key].edges[0].node.valueXdr;
    const contractId = data[key].edges[0].node.contractId;
    if (!base64Xdr) {
      throw new Error('No valueXdr found in the entry');
    }

    const parsedData: any = StellarSdk.xdr.ScVal.fromXDR(base64Xdr, 'base64');
    const jsValues: any = scValToJs(parsedData);
    const parsedValue = {};
    if (typeof jsValues.storage !== 'undefined') {
      Object.assign(parsedValue, { ['contractId']: contractId });
      Object.assign(parsedValue, {
        ['token0']: scValToJs(jsValues.storage()[4].val())['token_a'],
      });
      Object.assign(parsedValue, {
        ['token1']: scValToJs(jsValues.storage()[4].val())['token_b'],
      });

      Object.assign(parsedValue, {
        ['reserve0']: scValToJs(jsValues.storage()[1].val()),
      });

      Object.assign(parsedValue, {
        ['reserve1']: scValToJs(jsValues.storage()[2].val()),
      });

      parsedEntries.push(parsedValue);
    }
  }
  return parsedEntries;
};
