import { PrismaClient } from '@prisma/client';
const StellarSdk = require("stellar-sdk");

import { createDummyUser, createDummyToken, createDummyLP, createDummyAddEvent, createDummyRemoveEvent, createDummySwapEvent, createDummySwapEventPath } from './createDummyData';

const prisma = new PrismaClient();

const keyPair1 = createDummyUser();
const keyPair2 = createDummyUser();
const keyPair3 = createDummyUser();
const keyPair4 = createDummyUser();

const astroDollar = createDummyToken(keyPair1.publicKey);
const soroDollar = createDummyToken(keyPair2.publicKey);
const stellarAsset = createDummyToken(keyPair3.publicKey);

const pair1 = createDummyLP(astroDollar.address, soroDollar.address);
const pair2 = createDummyLP(astroDollar.address, stellarAsset.address);

const addEvent1Dummy = createDummyAddEvent(keyPair1.publicKey, pair1.address, 2000, 2000, 2000);
const addEvent2Dummy = createDummyAddEvent(keyPair2.publicKey, pair2.address, 1000, 1000, 1000);

const removeEvent1Dummy = createDummyRemoveEvent(keyPair1.publicKey, pair1.address, 100, 100, 100);
const removeEvent2Dummy = createDummyRemoveEvent(keyPair2.publicKey, pair2.address, 200, 200, 200);

const swapEvent1Dummy = createDummySwapEvent(keyPair1.publicKey, soroDollar.address, stellarAsset.address, 100, 100);
const swapEventPath1Dummy = createDummySwapEventPath(swapEvent1Dummy.id, pair1.address, soroDollar.address, astroDollar.address, 150, 150);
const swapEventPath2Dummy = createDummySwapEventPath(swapEvent1Dummy.id, pair2.address, astroDollar.address, stellarAsset.address, 150, 150);

async function main() {

  // create two dummy articles
  const user1 = await prisma.user.upsert({
    where: { publicKey: keyPair1.publicKey },
    update: {},
    create: {
        publicKey: keyPair1.publicKey,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { publicKey: keyPair2.publicKey },
    update: {},
    create: {
        publicKey: keyPair2.publicKey,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { publicKey: keyPair3.publicKey },
    update: {},
    create: {
        publicKey: keyPair3.publicKey,
    },
  });

  const user4 = await prisma.user.upsert({
    where: { publicKey: keyPair4.publicKey },
    update: {},
    create: {
        publicKey: keyPair4.publicKey,
    },
  });

  const token1 = await prisma.token.upsert({
    where: { address: stellarAsset.address },
    update: {},
    create: {
        address: stellarAsset.address,
        code: "fXLM",
        name: "fakeLumens",
    },
  });

  const token2 = await prisma.token.upsert({
    where: { address: astroDollar.address},
    update: {},
    create: {
        address: astroDollar.address,
        code: astroDollar.code,
        name: astroDollar.name,
        issuer: astroDollar.issuer,
        stellarAsset: astroDollar.stellarAsset
    },
  });

  const token3 = await prisma.token.upsert({
    where: { address: soroDollar.address},
    update: {},
    create: {
      address: soroDollar.address,
      code: soroDollar.code,
      name: soroDollar.name,
      issuer: soroDollar.issuer,
      stellarAsset: soroDollar.stellarAsset
    },
  });

  const liquidityPool1 = await prisma.liquidityPool.upsert({
    where: { address: pair1.address },
    update: {},
    create: {
      address: pair1.address,
      tokenAAddress: pair1.token1,
      tokenBAddress: pair1.token2,
    },
  });

  const liquidityPool2 = await prisma.liquidityPool.upsert({
    where: { address: pair2.address },
    update: {},
    create: {
      address: pair2.address,
      tokenAAddress: pair2.token1,
      tokenBAddress: pair2.token2,
    },
  });

  const addEvent1 = await prisma.addEvent.upsert({
    where: { id: addEvent1Dummy.id },
    update: {},
    create: {
      id: addEvent1Dummy.id,
      userPublicKey: addEvent1Dummy.user,
      poolAddress: addEvent1Dummy.pool,
      amountA: addEvent1Dummy.amountA,
      amountB: addEvent1Dummy.amountB,
      liquidity: addEvent1Dummy.liquidity,
      ledger: addEvent1Dummy.ledger,
      timestamp: addEvent1Dummy.timestamp,
    },
  });

  const addEvent2 = await prisma.addEvent.upsert({
    where: { id: addEvent2Dummy.id },
    update: {},
    create: {
      id: addEvent2Dummy.id,
      userPublicKey: addEvent2Dummy.user,
      poolAddress: addEvent2Dummy.pool,
      amountA: addEvent2Dummy.amountA,
      amountB: addEvent2Dummy.amountB,
      liquidity: addEvent2Dummy.liquidity,
      ledger: addEvent2Dummy.ledger,
      timestamp: addEvent2Dummy.timestamp,
    },
  });

  const removeEvent1 = await prisma.removeEvent.upsert({
    where: { id: removeEvent1Dummy.id },
    update: {},
    create: {
      id: removeEvent1Dummy.id,
      userPublicKey: removeEvent1Dummy.user,
      poolAddress: removeEvent1Dummy.pool,
      amountA: removeEvent1Dummy.amountA,
      amountB: removeEvent1Dummy.amountB,
      liquidity: removeEvent1Dummy.liquidity,
      ledger: removeEvent1Dummy.ledger,
      timestamp: removeEvent1Dummy.timestamp,
    },
  });

  const removeEvent2 = await prisma.removeEvent.upsert({
    where: { id: removeEvent2Dummy.id },
    update: {},
    create: {
      id: removeEvent2Dummy.id,
      userPublicKey: removeEvent2Dummy.user,
      poolAddress: removeEvent2Dummy.pool,
      amountA: removeEvent2Dummy.amountA,
      amountB: removeEvent2Dummy.amountB,
      liquidity: removeEvent2Dummy.liquidity,
      ledger: removeEvent2Dummy.ledger,
      timestamp: removeEvent2Dummy.timestamp,
    },
  });

  const swapEvent = await prisma.swapEvent.upsert({
    where: { id: swapEvent1Dummy.id },
    update: {},
    create: {
      id: swapEvent1Dummy.id,
      userPublicKey: swapEvent1Dummy.user,
      tokenInAddress: swapEvent1Dummy.tokenIn,
      tokenOutAddress: swapEvent1Dummy.tokenOut,
      amountIn: swapEvent1Dummy.amountIn,
      amountOut: swapEvent1Dummy.amountOut,
      ledger: swapEvent1Dummy.ledger,
      timestamp: swapEvent1Dummy.timestamp,
    },
  });

  const swapEventPath1 = await prisma.swapEventPath.upsert({
    where: { id: swapEventPath1Dummy.id },
    update: {},
    create: {
      id: swapEventPath1Dummy.id,
      swapEventId: swapEventPath1Dummy.swapEvent,
      poolAddress: swapEventPath1Dummy.pool,
      tokenInAddress: swapEventPath1Dummy.tokenIn,
      tokenOutAddress: swapEventPath1Dummy.tokenOut,
      amountIn: swapEventPath1Dummy.amountIn,
      amountOut: swapEventPath1Dummy.amountOut,
    },
  });

  const swapEventPath2 = await prisma.swapEventPath.upsert({
    where: { id: swapEventPath2Dummy.id },
    update: {},
    create: {
      id: swapEventPath2Dummy.id,
      swapEventId: swapEventPath2Dummy.swapEvent,
      poolAddress: swapEventPath2Dummy.pool,
      tokenInAddress: swapEventPath2Dummy.tokenIn,
      tokenOutAddress: swapEventPath2Dummy.tokenOut,
      amountIn: swapEventPath2Dummy.amountIn,
      amountOut: swapEventPath2Dummy.amountOut,
    },
  });

  console.log({ user1, user2, user3, user4, token1, token2, token3, liquidityPool1, liquidityPool2, addEvent1, addEvent2, removeEvent1, removeEvent2, swapEvent, swapEventPath1, swapEventPath2 });

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
