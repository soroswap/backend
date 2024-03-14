import { Network } from '@prisma/client';
import { mainnetSoroswapContracts } from '../constants';
import { axiosApiBackendInstance } from './axios';

/**
 * Function to get address of the router contract in testnet provided by the Soroswap API.
 * @returns The address of the router contract in testnet.
 */
export async function getRouterAddress(network: string) {
  let contractId: string;
  if (network == Network.MAINNET) {
    contractId = mainnetSoroswapContracts.router;
  } else {
    const { data } = await axiosApiBackendInstance.get('/api/testnet/router');
    contractId = data.address;
  }
  return contractId;
}
