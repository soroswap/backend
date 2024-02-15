import { scValToJs } from 'mercury-sdk';
import * as StellarSdk from '@stellar/stellar-sdk';

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
