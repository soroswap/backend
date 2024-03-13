export const constants = {
  instanceStorageKeyXdr: 'AAAAFA==',
  phoenixLpVecKeyXdr: 'AAAAAwAAAAI=',
  phoenixConfigKeyXdr: 'AAAAAwAAAAE=',
  phoenixInitializedKeyXdr: 'AAAAAwAAAAM=',
};

// TODO: Temporary, look for a different way to filter out factory addresses that might get confused with pair addresses since the keyXdr is the same
// See if it can be done with Mercury
export const factoryAddresses = {
  soroswap: [
    'CACNV57SEONNCSNTLVYTFVFQD7SJQVZZPXR2ZEPDEBA42MSWSYFNRSP7',
    'CC4UOWU7HWS44WM5VEU4JWG6FMRKBREFQMWNQLYH6TLM7IY6NPASW5OM',
    'CDW5FJFWONTIZ3TBARC6SQFXG3HLIBAJGNI5VAWIWXW6BJ3NPSD2PGZ4',
  ],
  phoenix: ['CBUC5YJ2QTJEQ3HBA2SJEUUATB2YYOYEVXZKMKR7RE2GTGSXUI467Q7S'],
};

export const mainnetSoroswapContracts = {
  router: 'CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH',
  factory: 'CA4HEQTL2WPEUYKYKCDOHCDNIV4QHNJ7EL4J4NQ6VADP7SYHVRYZ7AW2',
};

export const mainnetPhoenixContracts = {
  factory: '',
  multihop: '',
};

export const testnetPhoenixContracts = {
  factory: '',
  multihop: '',
};
