import * as sdk from 'stellar-sdk';

export function getKeyXdrForPair(pairIndex: number) {
  const indexScVal = sdk.nativeToScVal(Number(pairIndex), { type: "u32"});
  const vecScVal = sdk.xdr.ScVal.scvVec([sdk.xdr.ScVal.scvSymbol("PairAddressesNIndexed"), indexScVal])
  const key_xdr = vecScVal.toXDR('base64');

  return key_xdr;
};