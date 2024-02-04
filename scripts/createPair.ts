import * as StellarSdk from '@stellar/stellar-sdk';
import { SorobanRpc } from '@stellar/stellar-sdk';
import { getRouterAddress } from '../src/utils/getRouterAddress';
// const sorobanDir = '/workspace/.soroban';

const server: StellarSdk.Horizon.Server = new StellarSdk.Horizon.Server(
  'https://horizon-testnet.stellar.org/',
);
const sorobanServer: SorobanRpc.Server = new SorobanRpc.Server(
  'http://localhost:8000/soroban/rpc',
  { allowHttp: true },
);
const friendbot = 'http://localhost:8000/friendbot?addr=';
const passphrase = 'Test SDF Network ; September 2015';

function createToken(name: string, issuerPublicKey: string) {
  return new StellarSdk.Asset(name, issuerPublicKey);
}

const name_parts = [
  'zim',
  'lay',
  'veo',
  'tak',
  'rud',
  'pia',
  'nov',
  'kul',
  'jor',
  'fyx',
  'bax',
  'wun',
  'voe',
  'quy',
  'pyr',
  'otz',
  'mil',
  'kra',
  'jix',
  'gex',
  'dex',
  'uxi',
  'tro',
  'siv',
  'rya',
  'nef',
  'laz',
  'kev',
  'jam',
  'fiz',
  'cyo',
  'vax',
  'uvi',
  'tez',
  'rog',
  'peq',
  'nyl',
  'lom',
  'kib',
  'jah',
];

function generateRandomName() {
  const part1 = name_parts[Math.floor(Math.random() * name_parts.length)];
  const part2 = name_parts[Math.floor(Math.random() * name_parts.length)];
  return part1 + part2;
}

// async function classic_mint(
//   user: StellarSdk.Keypair,
//   asset: StellarSdk.Asset,
//   amount: string,
//   source: StellarSdk.Keypair,
// ) {
//   const operation = StellarSdk.Operation.payment({
//     amount: amount,
//     asset: asset,
//     destination: user.publicKey(),
//     source: source.publicKey(),
//   });
//   await invokeClassicOp(operation, source);
// }

// async function createTxBuilder(source: StellarSdk.Keypair) {
//   try {
//     const account = await server.loadAccount(source.publicKey());
//     return new StellarSdk.TransactionBuilder(account, {
//       fee: '10000',
//       timebounds: { minTime: 0, maxTime: 0 },
//       networkPassphrase: passphrase,
//     });
//   } catch (e) {
//     console.error(e);
//     throw Error('unable to create txBuilder');
//   }
// }

// async function invokeClassicOp(operation: any, source: StellarSdk.Keypair) {
//   const txBuilder = await createTxBuilder(source);
//   txBuilder.addOperation(operation);
//   const tx = txBuilder.build();
//   tx.sign(source);
//   try {
//     await server.submitTransaction(tx);
//     // const tx_hash = response.hash;
//     // Poll this until the status is not "NOT_FOUND"
//     // while (status === 'PENDING' || status === 'NOT_FOUND') {
//     //   // See if the transaction is complete
//     //   await new Promise((resolve) => setTimeout(resolve, 2000));
//     //   // console.log('checking tx...');
//     //   response = await server.getTransaction(tx_hash);
//     //   status = response.status;
//     // }
//     // // console.log('Transaction status:', response.status);
//     // if (status === 'ERROR') {
//     //   console.log(response);
//     // }
//     // console.log('Classic op TX submitted:', tx_hash);
//     // return tx_hash;
//   } catch (e) {
//     console.error(e.response.data.extras);
//     throw Error('failed to submit classic op TX');
//   }
// }

// async function classic_trustline(
//   user: StellarSdk.Keypair,
//   asset: StellarSdk.Asset,
// ) {
//   const operation = StellarSdk.Operation.changeTrust({
//     source: user.publicKey(),
//     asset: new StellarSdk.Asset(asset.code, asset.issuer),
//   });

//   const source = await server.loadAccount(user.publicKey());
//   try {
//     const tx = new StellarSdk.TransactionBuilder(source, {
//       fee: '100',
//       networkPassphrase: passphrase,
//     })
//       .addOperation(operation)
//       .setTimeout(StellarSdk.TimeoutInfinite)
//       .build();
//     tx.sign(user);
//     await server.submitTransaction(tx);
//   } catch (error) {
//     console.log(error);
//   }

//   // await invokeClassicOp(operation, user);
// }

async function main() {
  const adminKeypair = StellarSdk.Keypair.fromSecret(
    'SDLOPMZLHNXXTZPJBPDQDUXHTZ4WDQDO5YTMXDYQ7AO2QEUSATPDYZ7I',
  );
  try {
    await fetch(friendbot + adminKeypair.publicKey());
  } catch (error) {
    console.log('already funded. skipping');
  }

  const nameA = generateRandomName();
  const symbolA = nameA.substring(0, 4).toUpperCase();

  const token_a = createToken(symbolA, adminKeypair.publicKey());

  await wrapStellarAsset({
    adminKeypair,
    code: token_a.code,
    issuer: token_a.issuer,
  });

  console.log('token_a', token_a.contractId(passphrase));

  const routerAddress = await getRouterAddress();
  console.log('🚀 « routerAddress:', routerAddress);

  console.log(
    await getBalance(token_a.contractId(passphrase), 'balance', adminKeypair),
  );

  // Creating pair and Adding Liquidity
  // await createPair(
  //   adminKeypair,
  //   routerAddress,
  //   token_a.contractId(passphrase),
  //   token_b.contractId(passphrase),
  // );
}

main();

async function createPair(
  adminKeypair: StellarSdk.Keypair,
  routerAddress: string,
  tokenA: string,
  tokenB: string,
) {
  const args = [
    new StellarSdk.Address(tokenA).toScVal(),
    new StellarSdk.Address(tokenB).toScVal(),
    StellarSdk.nativeToScVal(1000000), //   desiredAScVal
    StellarSdk.nativeToScVal(1000000), //   desiredBScVal
    StellarSdk.nativeToScVal(0), //   minAScVal
    StellarSdk.nativeToScVal(0), //   minBScVal
    new StellarSdk.Address(adminKeypair.publicKey()).toScVal,
    StellarSdk.nativeToScVal(1000),
  ];

  const txn = await contractTransaction(
    adminKeypair,
    routerAddress,
    'add_liquidity',
    args,
  );

  try {
    const preparedTxn = await sorobanServer.prepareTransaction(txn);
    console.log('🚀 « preparedTxn:', preparedTxn);
    // txn.sign(adminKeypair);

    // return await sorobanServer.sendTransaction(txn);
  } catch (error) {
    console.log(error);
  }
}

async function contractTransaction(
  adminKeypair: StellarSdk.Keypair,
  contractAddress: string,
  method: string,
  args: any,
): Promise<StellarSdk.Transaction> {
  const source = await sorobanServer.getAccount(adminKeypair.publicKey());

  const contract = new StellarSdk.Contract(contractAddress);
  return new StellarSdk.TransactionBuilder(source, {
    fee: '100',
    networkPassphrase: passphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(StellarSdk.TimeoutInfinite)
    .build();
}

export async function wrapStellarAsset({
  adminKeypair,
  code,
  issuer,
}: {
  adminKeypair: StellarSdk.Keypair;
  code: string;
  issuer: string;
}) {
  const source = await sorobanServer.getAccount(adminKeypair.publicKey());

  const operation = StellarSdk.Operation.createStellarAssetContract({
    asset: new StellarSdk.Asset(code, issuer),
  });

  let txn = new StellarSdk.TransactionBuilder(source, {
    fee: '100',
    networkPassphrase: passphrase,
  })
    .addOperation(operation)
    .setTimeout(StellarSdk.TimeoutInfinite)
    .build();

  try {
    txn = await sorobanServer.prepareTransaction(txn);
    txn.sign(adminKeypair);

    return await sorobanServer.sendTransaction(txn);
  } catch (error) {
    console.log(error);
  }
}

async function getBalance(
  contractId: string,
  method: string,
  user: StellarSdk.Keypair,
) {
  try {
    const operation = StellarSdk.Operation.invokeContractFunction({
      contract: contractId,
      function: method,
      args: [new StellarSdk.Address(user.publicKey()).toScVal()],
    });

    const tx = await buildTransaction(user, operation);
    const preparedTransaction = await sorobanServer.prepareTransaction(tx);
    const simulated =
      await sorobanServer.simulateTransaction(preparedTransaction);
    const parsedResult = StellarSdk.scValToNative(
      simulated.result.retval,
    ).toString();

    return simulated;
  } catch (error) {
    console.log(`Error reading contract: ${contractId}`, error);
  }
}

async function buildTransaction(source, ...operations) {
  const sourceAccount = await sorobanServer.getAccount(source.publicKey());

  const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: passphrase,
  });
  operations.forEach((op) => {
    transaction.addOperation(op);
  });
  const builtTransaction = transaction.setTimeout(30).build();
  builtTransaction.sign(source);

  return builtTransaction;
}
