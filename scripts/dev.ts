import * as sdk from 'stellar-sdk'
import { getRouterAddress } from '../src/utils/getRouterAddress';
const server = new sdk.Horizon.Server('https://horizon-testnet.stellar.org');

class LpCallResponse {
    records: [{}]
}
class lpRecord  {
    _links: {
        self: {
            href: string
        }
    }
}


//Define prices
const XLMPrice = 0.1082;
const USDCPrice = 1;

const router_address = async ()=> {
    const router_address = await getRouterAddress()
    console.log(router_address)
    return router_address
};
router_address()
// Calculate liquidity
function getLiquidity(reserve0: number, reserve1: number, price0: number, price1: number) {
    return (reserve0 * price0) + (reserve1 * price1);
}
// Get liquidity pools (by default returns 10)
server.liquidityPools().limit(200).call().then((response) => {
    for (const key in response.records) {
        const element = response.records[key]
        if (element.reserves[0].asset.includes('native') && element.reserves[1].asset.includes('USDC')) {
            const liquidity = getLiquidity(parseFloat(element.reserves[0].amount), parseFloat(element.reserves[1].amount), XLMPrice, USDCPrice);
            if(liquidity>0){
                console.log(element);
                console.log('Liquidity: ' + liquidity);
                }
            }
        }
    });

/* // Get liquidity pools with queries
server.liquidityPools().limit(10).call().then((response) => {
    console.log(response[2].reserves);
    }); */

// Get changes of liquidity pools on stream
/* server.liquidityPools().stream({
    onmessage: (response) => {
        console.log(response);
    }
}); */

/* 
    Crear usuario, fondear con XLM, comprar USDC, fondear con USDC, comprar XLM, retirar XLMX8
*/