// npx ts-node prisma/dummyDataGenerators/createDummyUser.ts

import internal from "stream";

const crypto = require("crypto");

export const createDummyUser = () => { 
    return {
        publicKey: 'c' + crypto.randomBytes(32).toString('hex'),
        privateKey: 's' + crypto.randomBytes(32).toString('hex'),
    }
}

export const createDummyToken = (issuer: string) => {
    let tokenCode = crypto.randomBytes(4).toString('hex')
    return {
        address: 't' + crypto.randomBytes(32).toString('hex'),
        code: tokenCode,
        name: tokenCode + 'Coin',
        issuer: issuer,
        stellarAsset: false
    }
}

export const createDummyLP = (token1: string, token2: string) => {
    return {
        address: 'lp' + crypto.randomBytes(32).toString('hex'),
        token1: token1,
        token2: token2,
    }
}

let lastLedger = 1;
let lastAddId = 0;
export const createDummyAddEvent = (user: string, pool: string, amountA: number, amountB: number, liquidity: number ) => {
    return {
        id: lastAddId++,
        user: user,
        pool: pool,
        amountA: amountA,
        amountB: amountB,
        liquidity: liquidity,
        ledger: lastLedger++,
        timestamp: new Date().toISOString(),
    }
}

let lastRemoveId = 0;
export const createDummyRemoveEvent = (user: string, pool: string, amountA: number, amountB: number, liquidity: number ) => {
    return {
        id: lastRemoveId++,
        user: user,
        pool: pool,
        amountA: amountA,
        amountB: amountB,
        liquidity: liquidity,
        ledger: lastLedger++,
        timestamp: new Date().toISOString(),
    }
}

let lastSwapId = 0;
export const createDummySwapEvent = (user: string, tokenIn: string, tokenOut: string, amountIn: number, amountOut: number) => {
    return {
        id: lastSwapId++,
        user: user,
        tokenIn: tokenIn,
        tokenOut: tokenOut,
        amountIn: amountIn,
        amountOut: amountOut,
        ledger: lastLedger++,
        timestamp: new Date().toISOString(),
    }
}

let lastSwapStepId = 0;
export const createDummySwapEventPath = (swapId: number, pool: string, tokenIn: string, tokenOut: string, amountIn: number, amountOut: number) => {
    return {
        id: lastSwapStepId++,
        swapEvent: swapId,
        pool: pool,
        tokenIn: tokenIn,
        tokenOut: tokenOut,
        amountIn: amountIn,
        amountOut: amountOut,
    }
}