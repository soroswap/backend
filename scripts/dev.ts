import * as sdk from 'stellar-sdk';

const server = new sdk.Horizon.Server('https://horizon-testnet.stellar.org');

class LiquidityPool {
  _links: {};
  id: string;
  paging_token: string;
  fee_bp: number;
  type: string;
  total_shares: string;
  reserves: { asset: string, amount: string }[];
  last_modified_ledger: number;
  last_modified_time: string;
}

// accounts
const accounts = [
  {   // issuer
    publicKey: "GCGWVN2S5XKAIZPGS2Q3SWX747MGIT4WKMJD6BGROFXV4DG73ECYLUKI",
    secretKey: "SB2MZXAWNGIOR23U7JVVQUTX4KBY7VSYU6UEKMLYE2SLH7QAOQ72YRLP"
  },
  {   // account 1
    publicKey: "GAALDIAGTB2IVBBEDDH63DM24WUHSI5R5EKXA4XR25OGPRAD6SXFPIL3",
    secretKey: "SC7H2ZUCRVNB6ASWYVD6TE6KBY5FW3CDYRGIEWR4NBHD6FP3ICZW5A3Q"
  },
  {   // account 2
    publicKey: "GDQOERLYYOGW7F76WYBR5X4XLQPGZVBM5DGXOAAV33EPE6XJ7MUFMVSF",
    secretKey: "SAMR4UNRZSIO6W7URK2ADIG6GXKX6KUWRUA4BDG4O7E7KOINTOUXDPKK"
  },
];

const kps = accounts.map((account) => sdk.Keypair.fromSecret(account.secretKey));

const XLM = sdk.Asset.native();

(async function () {
  // get liquidity pools and return XLM / USDC pool
  const liquidityPool: LiquidityPool = await server.liquidityPools().limit(200).call().then((response) => {
    for (const key in response.records) {
      const element = response.records[key];
      if (element.reserves[0].asset.includes('native') && element.reserves[1].asset.includes('USDC')) {
        return element;
      }
    }
  })
  .catch((e) => {
    console.log('Error: ', e);
    return null;
  });

  // Create a transaction builder
  function buildTx(source, signer, ...ops) {
    let tx = new sdk.TransactionBuilder(source, {
      fee: sdk.BASE_FEE,
      networkPassphrase: sdk.Networks.TESTNET,
    });
    ops.forEach((op) => tx.addOperation(op));
    const transaction = tx.setTimeout(200).build();
    transaction.sign(signer);
    return transaction;
  }

  /**
   * Trusts an asset by changing the trustline of the source account.
   * 
   * @param server - The Horizon server instance.
   * @param source - The source account.
   * @param sourceKeys - The keypair of the source account.
   * @param asset - The asset to trust.
   */
  const trustAsset = async (
    server: sdk.Horizon.Server,
    source: sdk.Account,
    sourceKeys: sdk.Keypair,
    asset: sdk.Asset | sdk.LiquidityPoolAsset,
  ) => {
    try {
      const transaction = buildTx(
        source,
        sourceKeys,
        sdk.Operation.changeTrust({
          asset: asset,
          source: source.accountId(),
        })
      );
      server.submitTransaction(transaction).catch((e) => console.log('Error: ', e.response.data)).then((response) => console.log(response));
      account.incrementSequenceNumber();
    } catch (error) {
      console.log(error);
    }
  };

  // Define USDC token
  const USDCIssuer = liquidityPool.reserves[1].asset.split(':')[1];
  const USDC = new sdk.Asset("USDC", USDCIssuer);

  const accountData = await server.accounts().accountId(accounts[1].publicKey).call();
  const account = new sdk.Account(accountData.id, accountData.sequence);

  const liquidityPoolAsset = new sdk.LiquidityPoolAsset(XLM, USDC, 30)
  // Establish trustline with USDC token & LiquidityPoolAsset
  const tokenTrustline = await trustAsset(server, account, kps[1], USDC)
  const LPTrustline = await trustAsset(server, account, kps[1], liquidityPoolAsset)
  tokenTrustline
  LPTrustline
  
})();
