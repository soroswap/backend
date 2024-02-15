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
