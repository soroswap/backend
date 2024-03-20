import * as StellarSdk from '@stellar/stellar-sdk';
import { scValToNative } from '@stellar/stellar-sdk';
import { scValToJs } from 'mercury-sdk';
import { GetContractEventsResponse } from 'src/types';

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

    jsValues.fee = edge.node.txInfoByTx.fee;

    return jsValues;
  });

  return parsedData;
};

export const eventsByContractIdAndTopicParser = (
  data: GetContractEventsResponse,
) => {
  const returnObject: any = data;
  const parsedEdges = data.eventByContractIdAndTopic.edges.map((edge) => {
    const data = scValToNative(
      StellarSdk.xdr.ScVal.fromXDR(edge.node.data, 'base64'),
    );
    const amounts = data.amounts.map((amount) => Number(BigInt(amount)));
    data.amounts = amounts;
    edge.node.data = data;

    const topic1 = scValToNative(
      StellarSdk.xdr.ScVal.fromXDR(edge.node.topic1, 'base64'),
    );
    edge.node.topic1 = topic1;

    const topic2 = scValToNative(
      StellarSdk.xdr.ScVal.fromXDR(edge.node.topic2, 'base64'),
    );
    edge.node.topic2 = topic2;

    return edge;
  });

  returnObject.eventByContractIdAndTopic.edges = parsedEdges;

  return returnObject.eventByContractIdAndTopic;
};
