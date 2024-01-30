import { BadRequestException, Injectable } from '@nestjs/common';

import { Mercury, factoryInstanceParser } from 'mercury-sdk'
import { getFactoryAddress } from 'src/utils/getFactoryAddress';
import { subscribeToLedgerEntriesDto } from '../dto/subscribe.dto';


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
    async subscribeToPairs(data: subscribeToLedgerEntriesDto) {
        if (data.contractId.length > 1 ){
            const response = []
            for (let i = 0; i < data.contractId.length; i++) {
                const args = {
                    contractId: data.contractId[i],
                    keyXdr: data.keyXdr,
                    durability: data.durability,
                    hydrate: data.hydrate
                }
                const subscribeToPairs = await mercuryInstance.subscribeToLedgerEntries(args)
                response.push(subscribeToPairs)
            }
            return response;
        }
        else 
        if(data.contractId.length === 1) {
            const args = {
                contractId: data.contractId[0],
                keyXdr: data.keyXdr,
                durability: data.durability,
                hydrate: data.hydrate
            }
            const subscribeToPairs = await mercuryInstance.subscribeToLedgerEntries(args)
            return subscribeToPairs;
        }
        if(
            data.contractId.length === 0 || 
            !data.contractId || 
            !data.keyXdr
            ) {
            throw new BadRequestException('Please double check your request body')
        }
    }
}