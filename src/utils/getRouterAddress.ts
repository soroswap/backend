import { axiosApiBackendInstance } from './axios';

/**
 * Function to get address of the router contract in testnet provided by the Soroswap API.
 * @returns The address of the router contract in testnet.
 */
export async function getRouterAddress() {
  const { data } = await axiosApiBackendInstance.get('/api/testnet/router');
  const contractId = data.address;
  return contractId;
}
