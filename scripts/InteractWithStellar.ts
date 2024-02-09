import * as sdk from 'stellar-sdk';

const server = new sdk.Horizon.Server('https://horizon-testnet.stellar.org');
const friendbotURI = 'https://friendbot.stellar.org/?addr=';

class LiquidityPool {
  _links: {};
  id: string;
  paging_token: string;
  fee_bp: number;
  type: string;
  total_shares: string;
  reserves: { asset: string; amount: string }[];
  last_modified_ledger: number;
  last_modified_time: string;
}

class TestAccount {
  publicKey: string;
  secretKey: string;
}

// accounts
const accounts = [
  {
    // issuer
    publicKey: 'GCGWVN2S5XKAIZPGS2Q3SWX747MGIT4WKMJD6BGROFXV4DG73ECYLUKI',
    secretKey: 'SB2MZXAWNGIOR23U7JVVQUTX4KBY7VSYU6UEKMLYE2SLH7QAOQ72YRLP',
  },
  {
    // account 1
    publicKey: 'GAALDIAGTB2IVBBEDDH63DM24WUHSI5R5EKXA4XR25OGPRAD6SXFPIL3',
    secretKey: 'SC7H2ZUCRVNB6ASWYVD6TE6KBY5FW3CDYRGIEWR4NBHD6FP3ICZW5A3Q',
  },
  {
    // account 2
    publicKey: 'GDQOERLYYOGW7F76WYBR5X4XLQPGZVBM5DGXOAAV33EPE6XJ7MUFMVSF',
    secretKey: 'SAMR4UNRZSIO6W7URK2ADIG6GXKX6KUWRUA4BDG4O7E7KOINTOUXDPKK',
  },
];

(async function () {
  /**
   * Builds a transaction with the given source account, signer, and operations.
   * @param {string} source - The source account for the transaction.
   * @param {string} signer - The signer for the transaction.
   * @param {...sdk.Operation} ops - The operations to be added to the transaction.
   * @returns {sdk.Transaction} - The built transaction.
   */
  const buildTx = (source, signer, ...ops) => {
    let tx = new sdk.TransactionBuilder(source, {
      fee: sdk.BASE_FEE,
      networkPassphrase: sdk.Networks.TESTNET,
    });
    ops.forEach((op) => tx.addOperation(op));
    const transaction = tx.setTimeout(200).build();
    transaction.sign(signer);
    return transaction;
  };

  /**
   * Trusts an asset by changing the trustline of the source account.
   *
   * @param server - The Horizon server instance.
   * @param source - The source account.
   * @param sourceKeys - The keypair of the source account.
   * @param asset - The asset to trust.
   */

  // #TODO: Add support for multiple assets
  const trustAsset = async (
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
        }),
      );
      server
        .submitTransaction(transaction)
        .catch((e) => console.log('Error: ', e.response.data))
        .then((response) => console.log(response));
      account.incrementSequenceNumber();
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Swaps tokens from one account to another.
   *
   * @param source The source account.
   * @param signer The signer keypair.
   * @param amount The amount to be swapped.
   * @param sendAsset The asset to be sent.
   * @param destAsset The asset to be received.
   * @returns A promise that resolves to the transaction result.
   */
  const swapTokens = (
    source: sdk.Account,
    signer: sdk.Keypair,
    ammount: string,
    sendAsset: sdk.Asset,
    destAsset: sdk.Asset,
  ) => {
    return server
      .submitTransaction(
        buildTx(
          source,
          signer,
          sdk.Operation.pathPaymentStrictSend({
            sendAsset: sendAsset,
            sendAmount: ammount,
            destination: signer.publicKey(),
            destAsset: destAsset,
            destMin: '1',
            path: [sendAsset, destAsset],
          }),
        ),
      )
      .catch((e) => console.log('Error: ', e.response.data.extras));
  };

  /**
   * Adds liquidity to a liquidity pool.
   *
   * @param source - The source of the transaction.
   * @param signer - The signer of the transaction.
   * @param poolId - The ID of the liquidity pool.
   * @param maxReserveA - The maximum amount of reserve A to deposit.
   * @param maxReserveB - The maximum amount of reserve B to deposit.
   * @returns A promise that resolves to the result of the transaction submission.
   */
  const addLiquidity = (
    source: sdk.Account,
    signer: sdk.Keypair,
    poolId: string,
    maxReserveA: string,
    maxReserveB: string,
  ) => {
    const exactPrice = Number(maxReserveA) / Number(maxReserveB);
    const minPrice = exactPrice - exactPrice * 0.1;
    const maxPrice = exactPrice + exactPrice * 0.1;

    return server
      .submitTransaction(
        buildTx(
          source,
          signer,
          sdk.Operation.liquidityPoolDeposit({
            liquidityPoolId: poolId,
            maxAmountA: maxReserveA,
            maxAmountB: maxReserveB,
            minPrice: minPrice.toFixed(7),
            maxPrice: maxPrice.toFixed(7),
          }),
        ),
      )
      .catch((e) => console.log('Error: ', e.response.data.extras));
  };

  const removeLiquidity = (
    source: sdk.Account,
    signer: sdk.Keypair,
    poolId: string,
    sharesAmount: string,
  ) => {
    return server
      .liquidityPools()
      .liquidityPoolId(poolId)
      .call()
      .then((poolInfo) => {
        console.log(poolInfo);
        let totalShares = Number(poolInfo.total_shares);
        let sharesAmountNum = Number(sharesAmount);
        let minReserveA =
          (sharesAmountNum / totalShares) *
          Number(poolInfo.reserves[0].amount) *
          0.95;
        let minReserveB =
          (sharesAmountNum / totalShares) *
          Number(poolInfo.reserves[1].amount) *
          0.95;

        return server
          .submitTransaction(
            buildTx(
              source,
              signer,
              sdk.Operation.liquidityPoolWithdraw({
                liquidityPoolId: poolId,
                amount: sharesAmount,
                minAmountA: minReserveA.toFixed(7),
                minAmountB: minReserveB.toFixed(7),
              }),
            ),
          )
          .catch((e) => console.log('Error: ', e.response.data.extras));
      });
  };

  /**
   * Represents a liquidity pool.
   * @typedef {Object} LiquidityPool
   * @property {string} id - The ID of the liquidity pool.
   * @property {Array} reserves - The reserves of the liquidity pool.
   * @property {string} reserves.asset - The asset of the reserve.
   */
  const liquidityPool: LiquidityPool = await server
    .liquidityPools()
    .limit(200)
    .call()
    .then((response) => {
      for (const key in response.records) {
        const element = response.records[key];
        if (
          element.reserves[0].asset.includes('native') &&
          element.reserves[1].asset.includes('USDC')
        ) {
          return element;
        }
      }
    })
    .catch((e) => {
      console.log('Error: ', e);
      return null;
    });

  /**
   * Generates a user with a random keypair.
   * @returns {testAccount} The generated user with a private and public key.
   */
  const generateUser = (): TestAccount => {
    const keypair = sdk.Keypair.random();
    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret();
    return {
      secretKey,
      publicKey,
    };
  };

  /**
   * Funds an account by requesting testnet lumens from the friendbot service.
   * @param account The test account to fund.
   * @returns A promise that resolves when the account is successfully funded.
   */
  const fundAccount = async (account: TestAccount) => {
    try {
      const response = await fetch(
        `${friendbotURI}${encodeURIComponent(account.publicKey)}`,
      );
      const responseJSON = await response.json();
      if (responseJSON.successful) {
        console.log('SUCCESS! You have a new account :)\n');
      } else {
        if (
          responseJSON.detail ===
          'createAccountAlreadyExist (AAAAAAAAAGT/////AAAAAQAAAAAAAAAA/////AAAAAA=)'
        ) {
          console.log('Account already exists');
        } else {
          console.error('ERROR! :(\n', responseJSON);
        }
      }
    } catch (error) {
      console.error('ERROR!', error);
      throw new Error('Error funding account');
    }
  };

  /**
   * Represents the account data retrieved from the server.
   */
  const accountData = await server
    .accounts()
    .accountId(accounts[1].publicKey)
    .call();
  const account = new sdk.Account(accountData.id, accountData.sequence);

  /**
   * Define assets to be used in the transactions.
   * @type {sdk.Asset}
   */
  const XLM = sdk.Asset.native();

  const USDCIssuer = liquidityPool.reserves[1].asset.split(':')[1];
  const USDC = new sdk.Asset('USDC', USDCIssuer);

  const liquidityPoolAsset = new sdk.LiquidityPoolAsset(XLM, USDC, 30);

  /**
   * Array of keypairs generated from the secret keys of the accounts.
   * @type {sdk.Keypair[]}
   */
  const kps = accounts.map((account) =>
    sdk.Keypair.fromSecret(account.secretKey),
  );

  /// Set trustlines for USDC and Liquidity Pool
  const tokenTrustline = await trustAsset(account, kps[1], USDC);
  const LPTrustline = await trustAsset(account, kps[1], liquidityPoolAsset);

  /// Swap XLM for USDC and add liquidity
  await swapTokens(account, kps[1], '3000', XLM, USDC);
  await addLiquidity(account, kps[1], liquidityPool.id, '150', '25');
  await removeLiquidity(account, kps[1], liquidityPool.id, '0.000001');
})();
