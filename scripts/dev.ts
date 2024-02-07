import * as sdk from 'stellar-sdk'
import { getRouterAddress } from '../src/utils/getRouterAddress';
import { build } from 'joi';
const server = new sdk.Horizon.Server('https://horizon-testnet.stellar.org');

class LpCallResponse {
    records: LiquidityPoolRecords[]
}
class LiquidityPoolRecords  {
    _links: {
        self: {
            href: string
        }
    }
    id: string;
    paging_token: string;
    fee_bp: number;
    type: string;
    total_trustlines: string;
    total_shares: string;
    reserves: any[];
    last_modified_ledger: number;
    last_modified_time: string;
    self: any[];
    transactions: any[];
    operations: any[];
}

const testAccounts = [
    {
        //Issuer
        publicKey: "GCSAMANOLBUIM5FWTAGATTSCNQDKGMNNO47H333DP4PESK7LV2KDU5N5",
        secretKey: "SAB27TN7TRCTSOAR3RYZQ5C5XM3FDX3NJE7O7ELYMAFE4NFMGDELT2ZK"
    },
    {
        //User 1 account
        publicKey: "GAYBUBHPPOU6EQ2ESR6ZAFDRRJW7W3JQCRPVB7ATINN2LFX5QRLNR4J2",
        secretKey: "SAMBXTVQTN5DE5OTW4NUGQNW4FQZ5TU4QII2RAYANLUSVIWVCZYGVBJ3"
    },
    {
        //User 2 account
        publicKey: "GCOWELIU2CNYAT3VS3B7SNEMDKEBZ4OQW6X3USFOMTRVY5FQRUEFIMD5",
        secretKey: "SD3U42AJYCETBI2PXWUJRENVEVAZW7R2LD55RVUJPLJIQDFPV7RRMDDH"
    },
]

class TxMaker {
    private horizonServer: sdk.Horizon.Server;
    private sorobanServer: sdk.SorobanRpc.Server;
    private friendbotURI: string;
    private routerContractAddress: string;
    private network: string;

    constructor(
        horizonServer: string,
        sorobanServer: string,
        friendbotURI: string,
        routerContractAddress: string,
        network: string
    ) {
        this.horizonServer = new sdk.Horizon.Server(horizonServer, {
            allowHttp: true
        });
        this.sorobanServer = new sdk.SorobanRpc.Server(sorobanServer, {
            allowHttp: true
        });
        this.friendbotURI = friendbotURI;
        this.routerContractAddress = routerContractAddress;
        this.network = network;
    }
    buildTx(source: sdk.Account, signer: sdk.Keypair, ...ops: sdk.xdr.Operation[]): sdk.Transaction {
        let tx: sdk.TransactionBuilder = new sdk.TransactionBuilder(source, {
            fee: sdk.BASE_FEE,
            networkPassphrase: sdk.Networks.TESTNET,
        });

        ops.forEach((op) => tx.addOperation(op));

        const txBuilt: sdk.Transaction = tx.setTimeout(30).build();
        txBuilt.sign(signer);

        return txBuilt;
    }
    async fundAccount(account): Promise<void> {
        try {
            const response = await fetch(
                `${this.friendbotURI}${encodeURIComponent(
                    account.publicKey,
                )}`,
            );
            const responseJSON = await response.json();
            if (responseJSON.successful) {
                console.log("SUCCESS! You have a new account :)\n");
            } else {
                if (
                    responseJSON.detail ===
                    "createAccountAlreadyExist (AAAAAAAAAGT/////AAAAAQAAAAAAAAAA/////AAAAAA=)"
                ) {
                    console.log("Account already exists");
                } else {
                    console.error("ERROR! :(\n", responseJSON);
                }
            }
        } catch (error) {
            console.error("ERROR!", error);
        }
    }

}

const txMaker = new TxMaker(
    "https://horizon-testnet.stellar.org",
    "https://soroban-testnet.stellar.org",
    "https://friendbot.stellar.org/?addr=",
    "CA7CSMGY7KHVWETXFZXURSF7WRGIBHYZGEL6UKR3GU3C54TV36PJULOU",
    "testnet"
);

async function fundAccounts(accounts: any[]): Promise<string>  {
    for (const account of accounts) {
        await txMaker.fundAccount(account);
    }
    return "Accounts funded";
}
fundAccounts(testAccounts)

const USDC = new sdk.Asset("USDC", "GCSAMANOLBUIM5FWTAGATTSCNQDKGMNNO47H333DP4PESK7LV2KDU5N5");
const XLM = sdk.Asset.native();

function liquidityPoolAsset(assetA: sdk.Asset, assetB: sdk.Asset) {
    return new sdk.LiquidityPoolAsset(assetA, assetB, sdk.LiquidityPoolFeeV18);
}

const poolShareAsset = new sdk.LiquidityPoolAsset(
    USDC,
    XLM,
    sdk.LiquidityPoolFeeV18
)


function establishPoolTrustline(account, keyPair, poolAsset) {
    return server.submitTransaction(
        txMaker.buildTx(
            account,
            keyPair,
            sdk.Operation.changeTrust({
                asset: poolAsset,
                limit: "1000000000",
            }),
        ),
        )
}

establishPoolTrustline(testAccounts[0], sdk.Keypair.fromSecret(testAccounts[0].secretKey), poolShareAsset)
//Define prices
const XLMPrice = 0.1082;
const USDCPrice = 1;


//router_address()
// Calculate liquidity
function getLiquidity(reserve0: number, reserve1: number, price0: number, price1: number) {
    return (reserve0 * price0) + (reserve1 * price1);
}
// Get liquidity pools (by default returns 10)
/* server.liquidityPools().limit(200).call().then((response: any) => {
    for (const key in response.records) {
        const element = response.records[key]
        //console.log(element.reserves)
        if (element.reserves[0].asset.includes('native') && element.reserves[1].asset.includes('USD')) {
            const liquidity = getLiquidity(parseFloat(element.reserves[0].amount), parseFloat(element.reserves[1].amount), XLMPrice, USDCPrice);
            if(liquidity>0){
                console.log(element);
                console.log('Liquidity: ' + liquidity);
                }
            }
        }
    });
 */
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
    Encontrar LP con XLM y USDC
    Crear usuario, fondear con XLM, comprar USDC
*/