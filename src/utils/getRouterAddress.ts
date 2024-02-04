import axios from 'axios';

/**
 * Function to get address of the router contract in testnet provided by the Soroswap API.
 * @returns The address of the router contract in testnet.
 */
export async function getRouterAddress() {
  const { data } = await axios.get('https://api.soroswap.finance/api/router');
  const testnetData = data.find((item) => item.network === 'testnet');
  const contractId = testnetData.router_address;
  return contractId;
}
