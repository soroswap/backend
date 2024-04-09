import { Network } from '@prisma/client';
import {
  mainnetSoroswapContracts,
  testnetSoroswapContracts,
} from '../constants';

export function getFactoryAddress(network: Network) {
  let contractId: string;

  if (network === Network.TESTNET) {
    contractId = testnetSoroswapContracts.factory;
  }

  if (network === Network.MAINNET) {
    contractId = mainnetSoroswapContracts.factory;
  }

  return contractId;
}
