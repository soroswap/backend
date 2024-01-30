import { Injectable } from '@nestjs/common';

import { Mercury, factoryInstanceParser } from 'mercury-sdk'
import { getFactoryAddress } from 'src/utils/getFactoryAddress';


const mercuryInstance = new Mercury({
  backendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT,
  graphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT,
  email: process.env.MERCURY_TESTER_EMAIL,
  password: process.env.MERCURY_TESTER_PASSWORD,
});

@Injectable()
export class PairsService {
    constructor(
    ) { }
    //Methods to serve controllers
    async findAllPairs() {
        const factoryAddress = await getFactoryAddress();
        const args = {
            contractId: factoryAddress,
            keyXdr: "AAAAFA==",
            durability: "persistent"
        }
        console.log(factoryAddress)
        const factoryEntries: any = await mercuryInstance.getContractEntries(args)
        .catch((err: any) => {
            console.log(err)
        })
        if(factoryEntries && factoryEntries.ok){
            console.log(factoryEntries.data.entryUpdateByContractId.edges)
            const parsedEntries: any = factoryInstanceParser(factoryEntries.data)
            return parsedEntries;
        }
    }
    //WIP: Retrieve pairs from mercury
    //WIP: Subscribe to multiple pairs
    async subscribeToPairs() {
        const pairsAdrresses = ['CAPETQIBGHZF6Q2FJPZUWCJDTNGLLQH7URFLPVQKYOXTJBCFOLQIVKIH', 'CBH7XVMGG3UF3TF5PV5PRTLD7KRY5SLPFDJJRWWBBQQKKCNVXX3JXLJL', 'CBOUTXJ63FREGO6J363WY3EDFJYGIQAQKGFB6TVLBRLXA2PIFSYZWRDC']
        const args = {
            contractId: pairsAdrresses,
            keyXdr: "AAAAFA==",
            durability: "persistent",
            hydrate: true
        }
        const subscribeToPairs = await mercuryInstance.subscribeToMultipleLedgerEntries(args)
        return subscribeToPairs;
    }
}