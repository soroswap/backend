import axios from 'axios';

/**
 * Function to get address of the factory contract in testnet provided by the Soroswap API.
 * @returns The address of the factory contract in testnet.
 */
export async function getFactoryAddress() {
  const { data } = await axios.get('https://api.soroswap.finance/api/factory');
  const testnetData = data.find((item) => item.network === 'testnet');
  const contractId = testnetData.factory_address;
  return contractId;
}
