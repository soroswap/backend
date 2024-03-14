import { Network } from '@prisma/client';
import axios from 'axios';
import { axiosApiBackendInstance } from './axios';

export async function getTokensList(
  network: Network,
  inheritedTokens?: TokenType[],
) {
  if (inheritedTokens) {
    return inheritedTokens;
  } else {
    let tokens: TokenType[];
    if (network == Network.MAINNET) {
      const { data } = await axios.get(
        'https://raw.githubusercontent.com/soroswap/token-list/main/tokenList.json',
      );
      tokens = data.tokens;
    } else {
      const { data } = await axiosApiBackendInstance.get('/api/tokens');
      tokens = data.find(
        (item) => item.network === network.toLowerCase(),
      ).tokens;
    }
    return tokens;
  }
}

export interface TokenType {
  issuer?: string;
  contract: string;
  name: string;
  code: string;
  decimals?: number;
  logoURI?: string;
}
