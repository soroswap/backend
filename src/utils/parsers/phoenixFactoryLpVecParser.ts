import { scValToJs } from 'mercury-sdk';
import * as StellarSdk from '@stellar/stellar-sdk';

/**
 * Parses the data from a ContractEntriesResponse object and returns an array with the addresses the pairs created by the Phoenix factory contract.
 * @param data The ContractEntriesResponse object to be parsed.
 * @returns An array of addresses.
 * @throws Error if no entries are provided or if no valueXdr is found in an entry.
 */
export const phoenixFactoryLpVecParser = (data: any) => {
  if (!data.entryUpdateByContractIdAndKey) {
    throw new Error('No entries provided');
  }
  const base64Xdr = data.entryUpdateByContractIdAndKey.edges[0].node.valueXdr;
  if (!base64Xdr) {
    throw new Error('No valueXdr found in the entry');
  }
  const parsedData: any = StellarSdk.xdr.ScVal.fromXDR(base64Xdr, 'base64');
  const jsValues: any = scValToJs(parsedData);

  return jsValues;
};
