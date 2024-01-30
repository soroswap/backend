import * as sdk from 'stellar-sdk';

/**
 * Function to get the keyXdr of a specific pair contract.
 * @param pairIndex Index of the pair in the PairAddressesNIndexed attribute of the Factory contract.
 * @returns The keyXdr of the pair as a string.
 */
export function getKeyXdrForPair(pairIndex: number) {
  const indexScVal = sdk.nativeToScVal(Number(pairIndex), { type: "u32"});
  const vecScVal = sdk.xdr.ScVal.scvVec([sdk.xdr.ScVal.scvSymbol("PairAddressesNIndexed"), indexScVal])
  const key_xdr = vecScVal.toXDR('base64');

  return key_xdr;
};