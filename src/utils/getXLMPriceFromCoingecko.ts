import axios from 'axios';

export const getXLMPriceFromCoingecko = async (): Promise<number> => {
  const currentXlmValueInUsd = await axios.get(
    'https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd',
  );
  return currentXlmValueInUsd.data.stellar.usd;
};

