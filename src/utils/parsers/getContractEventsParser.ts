import * as StellarSdk from '@stellar/stellar-sdk';
import { scValToNative } from '@stellar/stellar-sdk';
import { scValToJs } from 'mercury-sdk';
import { RouterTopic2 } from 'src/events/dto/events.dto';
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
    switch (edge.node.topic2) {
      case RouterTopic2.add:
        data.amount_a = Number(BigInt(data.amount_a));
        data.amount_b = Number(BigInt(data.amount_b));
        data.liquidity = Number(BigInt(data.liquidity));
        edge.node.data = data;
        break;
      case RouterTopic2.init:
        edge.node.data = data;
        break;
      case RouterTopic2.remove:
        data.amount_a = Number(BigInt(data.amount_a));
        data.amount_b = Number(BigInt(data.amount_b));
        data.liquidity = Number(BigInt(data.liquidity));
        edge.node.data = data;
        break;
      case RouterTopic2.swap:
        const amounts = data.amounts.map((amount: bigint) =>
          Number(BigInt(amount)),
        );
        data.amounts = amounts;
        edge.node.data = data;
        break;
      default:
        break;
    }

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
