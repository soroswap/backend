import { Network } from '@prisma/client';
import { mainnetSoroswapContracts } from '../constants';
import { axiosApiBackendInstance } from './axios';

/**
 * Function to get address of the factory contract in testnet provided by the Soroswap API.
 * @returns The address of the factory contract in testnet.
 */
export async function getFactoryAddress(network: Network) {
  let contractId: string;
  if (network == Network.MAINNET) {
    contractId = mainnetSoroswapContracts.factory;
  } else {
    const { data } = await axiosApiBackendInstance.get('/api/testnet/factory');
    contractId = data.address;
  }
  return contractId;
}
