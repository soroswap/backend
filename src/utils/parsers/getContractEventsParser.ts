import { GetContractEventsResponse } from '../../types';
import { scValToJs } from 'mercury-sdk';
import * as StellarSdk from '@stellar/stellar-sdk';

export const getContractEventsParser = (data: GetContractEventsResponse) => {
  const parsedData = data.eventByContractId.edges.map((edge) => {
    const data = StellarSdk.xdr.ScVal.fromXDR(edge.node.data, 'base64');

    const jsValues: any = scValToJs(data);

    const topic1Xdr = StellarSdk.xdr.ScVal.fromXDR(edge.node.topic1, 'base64');
    const topic1Js = scValToJs(topic1Xdr);
    const topic2Xdr = StellarSdk.xdr.ScVal.fromXDR(edge.node.topic2, 'base64');
    const topic2Js = scValToJs(topic2Xdr);

    jsValues.topic1 = topic1Js;
    jsValues.topic2 = topic2Js;

    const closeTime = new Date(
      Number(edge.node.txInfoByTx.ledgerByLedger.closeTime) * 1000,
    );
    jsValues.closeTime = closeTime;

    return jsValues;
  });

  return parsedData;
};
