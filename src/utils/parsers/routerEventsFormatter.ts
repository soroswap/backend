import { adjustAmountByDecimals } from '../adjustAmountByDecimals';
import { TokenType } from '../getTokensList';

export interface RouterEventFormatted {
  tokenA?: TokenType;
  tokenB?: TokenType;
  amountA: string;
  amountB: string;
  txHash: string;
  event: 'swap' | 'add' | 'remove';
  account?: string;
  timestamp: number;
}

export const routerEventsFormatter = (
  parsedContractEvents: any,
): RouterEventFormatted[] => {
  if (!parsedContractEvents) return [];
  return parsedContractEvents?.edges.map((edge) => {
    let tokenA: TokenType | undefined;
    let tokenB: TokenType | undefined;
    let amountA = '0';
    let amountB = '0';
    const txHash = edge.node.txInfoByTx.txHash;
    const event = edge.node?.topic2;
    const account = edge.node.data.to;
    const timestamp = edge.node.txInfoByTx.ledgerByLedger.closeTime * 1000;

    switch (event) {
      case 'swap':
        if (edge.node.data.path) {
          tokenA = edge.node.data.path[0];
          tokenB = edge.node.data.path[edge.node.data.path.length - 1];
        }
        if (edge.node.data.amounts) {
          amountA = adjustAmountByDecimals(
            edge.node.data.amounts[0],
            tokenA?.decimals,
          );
          amountB = adjustAmountByDecimals(
            edge.node.data.amounts[edge.node.data.amounts.length - 1],
            tokenB?.decimals,
          );
        }
        break;
      case 'add':
      case 'remove':
        tokenA = edge.node.data.token_a;
        tokenB = edge.node.data.token_b;
        amountA = adjustAmountByDecimals(
          edge.node.data.amount_a ?? 0,
          tokenA?.decimals,
        );
        amountB = adjustAmountByDecimals(
          edge.node.data.amount_b ?? 0,
          tokenB?.decimals,
        );
        break;
    }

    return {
      tokenA,
      tokenB,
      amountA,
      amountB,
      txHash,
      event,
      account,
      timestamp,
    };
  });
};
