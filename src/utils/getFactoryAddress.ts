import axios from 'axios';

export async function getFactoryAddress() {
    const { data } = await axios.get('https://api.soroswap.finance/api/factory');
    const testnetData = data.find(item => item.network === 'testnet');
    const contractId = testnetData.factory_address;
    return contractId;
}