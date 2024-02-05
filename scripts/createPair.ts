import * as StellarSdk from '@stellar/stellar-sdk';
import { SorobanRpc } from '@stellar/stellar-sdk';
import { getRouterAddress } from '../src/utils/getRouterAddress';

const sorobanServer: SorobanRpc.Server = new SorobanRpc.Server(
  'https://soroban-testnet.stellar.org/',
);
const friendbot = 'https://friendbot.stellar.org/?addr=';
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

async function main() {
  console.log('========== Initializing Admin Keypair ==========');
  const adminKeypair = StellarSdk.Keypair.random();
  console.log('Admin Keypair Secret:', adminKeypair.secret());
  console.log('Admin Keypair Public:', adminKeypair.publicKey());

  try {
    console.log('\n========== Funding Admin Account ==========');
    await fetch(friendbot + adminKeypair.publicKey());
    console.log('Admin account funded successfully.');
  } catch (error) {
    console.log('Funding Error: Already funded. Skipping...');
  }

  console.log('\n========== Token Initialization ==========');
  const nameA = generateRandomName();
  const symbolA = nameA.substring(0, 4).toUpperCase();
  console.log('Token Symbol:', symbolA);
  const token_a = createToken(symbolA, adminKeypair.publicKey());
  const xlmAddress = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

  console.log('\n========== Wrapping Asset in Soroban ==========');
  await wrapStellarAsset({
    adminKeypair,
    code: token_a.code,
    issuer: token_a.issuer,
  });
  console.log('Token wrapped successfully.');

  console.log('\n========== Token Contract Information ==========');
  console.log(symbolA, 'Contract ID:', token_a.contractId(passphrase));

  console.log('\n========== Liquidity Pool Operations ==========');
  const routerAddress = await getRouterAddress();

  console.log(
    'Creating liquidity pair and adding liquidity between XLM and',
    symbolA,
  );

  await createPair(
    adminKeypair,
    routerAddress,
    token_a.contractId(passphrase),
    xlmAddress,
  );
  console.log('Liquidity pool created successfully.');
}

async function createPair(
  adminKeypair: StellarSdk.Keypair,
  routerAddress: string,
  tokenA: string,
  tokenB: string,
) {
  const scValParams: StellarSdk.xdr.ScVal[] = [
    new StellarSdk.Address(tokenA).toScVal(),
    new StellarSdk.Address(tokenB).toScVal(),
    StellarSdk.nativeToScVal(1000000000000, { type: 'i128' }),
    StellarSdk.nativeToScVal(100000000, { type: 'i128' }),
    StellarSdk.nativeToScVal(0, { type: 'i128' }),
    StellarSdk.nativeToScVal(0, { type: 'i128' }),
    new StellarSdk.Address(adminKeypair.publicKey()).toScVal(),
    StellarSdk.nativeToScVal(getCurrentTimePlusOneHour(), { type: 'u64' }),
  ];

  const routerContract = new StellarSdk.Contract(routerAddress);
  const op = routerContract.call('add_liquidity', ...scValParams);
  const transaction = await buildTransaction(adminKeypair, op);
  const preparedTransaction =
    await sorobanServer.prepareTransaction(transaction);
  preparedTransaction.sign(adminKeypair);

  try {
    const txRes = await sorobanServer.sendTransaction(preparedTransaction);
    const confirmation = await waitForConfirmation(txRes.hash);
    return confirmation;
  } catch (error) {
    console.error(error);
  }
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

    const txnSent = await sorobanServer.sendTransaction(txn);
    return await waitForConfirmation(txnSent.hash);
  } catch (error) {
    console.log(error);
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

export async function waitForConfirmation(
  hash: string,
): Promise<
  | SorobanRpc.Api.GetSuccessfulTransactionResponse
  | SorobanRpc.Api.GetFailedTransactionResponse
> {
  console.log('waiting for confirmation hash:', hash);
  let confirmation;
  do {
    confirmation = await sorobanServer.getTransaction(hash);
    if (confirmation.status !== SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } while (true);
  return confirmation;
}

export const getCurrentTimePlusOneHour = (): number => {
  // Get the current time in milliseconds
  const now = Date.now();

  // Add one hour (3600000 milliseconds)
  const oneHourLater = now + 36000000;

  const oneHourLaterSeconds = Math.floor(oneHourLater / 1000);
  return oneHourLaterSeconds;
};

main();
