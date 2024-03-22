import { Network } from '@prisma/client';
import { getTokensList } from './getTokensList';

export async function getTokenData(network: Network, token: string) {
  const tokens = await getTokensList(network);
  const currentToken = tokens.find((item) => item.contract === token);

  const tokenData = {
    name: currentToken ? currentToken.name : token,
    symbol: currentToken ? currentToken.code : token,
    logo: currentToken?.icon,
  };
  return tokenData;
}
