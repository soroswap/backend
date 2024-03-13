import { axiosApiBackendInstance } from './axios';

/**
 * Function to get address of the factory contract in testnet provided by the Soroswap API.
 * @returns The address of the factory contract in testnet.
 */
export async function getFactoryAddress() {
  const { data } = await axiosApiBackendInstance.get('/api/testnet/factory');
  const contractId = data.address;
  return contractId;
}
