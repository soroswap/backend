import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Mercury } from 'mercury-sdk'
import * as sdk from 'stellar-sdk';

import { PrismaService } from 'src/prisma/prisma.service';
import { getFactoryAddress } from 'src/utils/getFactoryAddress';
import { AllPoolsRequestBodyDto, AllPoolsResponseDto } from './dto/pools.dto';
import { subscribeToLedgerEntriesDto } from './dto/subscribe.dto';

import { factoryInstanceParser } from '../utils/parsers/factoryInstanceParser';
import { pairAddressesParser } from '../utils/parsers/getPairEntriesParser';
import { pairInstanceParser } from '../utils/parsers/pairInstanceParser';

import { GET_LAST_CONTRACT_ENTRY } from '../utils/queries/getLastContractEntry';
import { buildGetPairAddressesQuery } from '../utils/queries/getPairAddresses';
import { buildGetPairWithTokensAndReservesQuery } from '../utils/queries/getPairWithTokensAndReserves';

const allPools = {
    pools: [
        {
            "token0": "CKL2NBVVBU7N6BYO2GVNPZCOCZMDAU2EJC5DM5E7R6AKBKTLNFW4BD",
            "token1": "CQWEM34J34WSVJEI2CPXDKBL7JZX34CXI47Y57NUPAVZZXYGBXPDNF4N",
            "reserve0": "20000",
            "reserve1": "199453",
        },
        {
            "token0": "CBUHSDNBVVBU7N6BYO2GVNPZCOCZMDAU2EJC5DM5E7R6AKBKTLNFW4BD",
            "token1": "CCR3M34J34WSVJEI2CPXDKBL7JZX34CXI47Y57NUPAVZZXYGBXPDNF4N",
            "reserve0": "10000",
            "reserve1": "3453453",
        },
        {
            "token0": "CJUHSDNBVVBU7N6BYO2GVNPZCOCZMDAU2EJC5DM5E7R6AKBKTLNFW4BD",
            "token1": "CJR3M34J34WSVJEI2CPXDKBL7JZX34CXI47Y57NUPAVZZXYGBXPDNF4N",
            "reserve0": "10000",
            "reserve1": "3453453"
        },
    ]
}

const mercuryInstance = new Mercury({
    backendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT,
    graphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT,
    email: process.env.MERCURY_TESTER_EMAIL,
    password: process.env.MERCURY_TESTER_PASSWORD,
});

@Injectable()
export class PairsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Function to get the keyXdr of a specific pair contract.
     * @param pairIndex Index of the pair in the PairAddressesNIndexed attribute of the Factory contract.
     * @returns The keyXdr of the pair as a string.
     */
    getKeyXdrForPair(pairIndex: number) {
        const indexScVal = sdk.nativeToScVal(Number(pairIndex), { type: "u32" });
        const vecScVal = sdk.xdr.ScVal.scvVec([sdk.xdr.ScVal.scvSymbol("PairAddressesNIndexed"), indexScVal])
        const key_xdr = vecScVal.toXDR('base64');

        return key_xdr;
    };

    /**
     * Subscribes to pairs in the ledger based on the provided data.
     * @param data - The data needed to subscribe to pairs.
     * @returns A promise that resolves to an array of subscribed pairs if multiple contract IDs are provided,
     * or a single subscribed pair if only one contract ID is provided.
     * @throws BadRequestException if the contract ID array is empty, or if either the contract ID or keyXdr is missing.
     */
    async subscribeToPairs(data: subscribeToLedgerEntriesDto) {
        if (data.contractId.length > 1) {
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
            if (data.contractId.length === 1) {
                const args = {
                    contractId: data.contractId[0],
                    keyXdr: data.keyXdr,
                    durability: data.durability,
                    hydrate: data.hydrate
                }
                const subscribeToPairs = await mercuryInstance.subscribeToLedgerEntries(args)
                return subscribeToPairs;
            }
        if (
            data.contractId.length === 0 ||
            !data.contractId ||
            !data.keyXdr
        ) {
            throw new BadRequestException('Please double check your request body')
        }
    }

    /**
     * Function to subscribe to a specific group of pairs from the PairAddressesNIndexed array of a Factory Contract.
     * @param first Index of the first pair of the group.
     * @param last Index of the last pair of the group.
     * @returns Nothing.
     */
    async subscribeToPairsOnFactory(first: number, last: number) {
        const contractId = await getFactoryAddress();
        //console.log("Contract ID:", contractId);

        let key_xdr;
        let subscribeResponse;
        let args;
        for (let i = first; i < last; i++) {
            key_xdr = this.getKeyXdrForPair(i);
            //console.log("keyXdr:", key_xdr);

            args = {
                contractId,
                key_xdr,
                durability: "persistent"
            }

            subscribeResponse = await mercuryInstance.subscribeToLedgerEntries(args).catch((err) => {
                console.error(err)
            });

            //console.log("Subscribe Response:", subscribeResponse);
        }
    };

    /**
     * Function to get the total number of pairs created by the factory.
     * @param mercuryInstance The Mercury instance to be used to make the request.
     * @returns The total number of pairs created by the factory.
     */
    async getPairCounter() {
        const contractId = await getFactoryAddress();
        const mercuryResponse = await mercuryInstance.getCustomQuery({ request: GET_LAST_CONTRACT_ENTRY, variables: { contractId, ledgerKey: "AAAAFA==" } })
            .catch((err: any) => {
                console.log(err)
                throw new ServiceUnavailableException('Error getting pair counter')
            })
        if (mercuryResponse && mercuryResponse.ok) {
            const parsedEntry = factoryInstanceParser(mercuryResponse.data);
            if (parsedEntry.length === 0) {
                return 0;
            }
            return parsedEntry[0].totalPairs;
        } else {
            throw new ServiceUnavailableException('Error getting pair counter')
        }
    }

    /**
     * Saves the count of Mercury pairs.
     * @returns The saved counter object.
     */
    async saveMercuryPairsCount(count: number) {
        const counter = await this.prisma.counter.upsert({
            where: {
                id: 1
            },
            update: {
                count: count
            },
            create: {
                count: count
            }
        })
        return counter;
    }

    /**
     * Retrieves the count of Mercury pairs.
     * @returns The count of Mercury pairs.
     */
    async getMercuryPairsCount() {
        const counter = await this.prisma.counter.findUnique({
            where: {
                id: 1
            }
        })
        return counter.count;
    }

    /**
     * Function to create object with variables to be used in the Mercury instance query.
     * @param pairCount Number of pairs to be retrieved.
     * @returns Object with the query variables.
     */
    async createVariablesForPairsAddresses(pairCount: number) {
        const contractId = await getFactoryAddress();

        let variables = { contractId };

        for (let i = 0; i < pairCount; i++) {
            const ledgerKey = this.getKeyXdrForPair(i);
            variables[`ledgerKey${i + 1}`] = ledgerKey;
        }

        return variables;
    }

    /**
     * Function to get array with all pair addresses stored in Factory Contract.
     * @returns Array with pair addresses.
     * @throws Error if Mercury request fails.
     */
    async getPairAddresses() {

        const pairCounter = await this.getPairCounter();
        const query = buildGetPairAddressesQuery(pairCounter);
        const variables = await this.createVariablesForPairsAddresses(pairCounter);

        const mercuryResponse = await mercuryInstance.getCustomQuery({ request: query, variables })
            .catch((err: any) => {
                console.log(err)
            });
        if (mercuryResponse && mercuryResponse.ok) {
            const parsedEntries = pairAddressesParser(mercuryResponse.data);
            return parsedEntries;
        } else {
            throw new Error("Error getting pair addresses")
        }

    };


    /**
     * Function to create object with variables to be used in the Mercury instance query.
     * @param pairCount Number of pairs to be retrieved.
     * @returns Object with the query variables.
     */
    async createVariablesForPairsTokensAndReserves(addresses: string[]) {
        let variables = {};
    
        for (let i = 0; i < addresses.length; i++) {
            variables[`contractId${i + 1}`] = addresses[i];
        }
    
        return variables;
    }

    /**
     * Function to get array with all subscribed pairs, along with their tokens and reserves.
     * @returns Array with pair objects.
     * @throws Error if Mercury request fails.
     */
    async getPairWithTokensAndReserves(addresses: string[]) {
        const query = buildGetPairWithTokensAndReservesQuery(addresses.length);
        const variables = await this.createVariablesForPairsTokensAndReserves(addresses);

        const mercuryResponse = await mercuryInstance.getCustomQuery({ request: query, variables })
            .catch((err: any) => {
                console.log(err)
            });

        if (mercuryResponse && mercuryResponse.ok) {
            const parsedEntries = pairInstanceParser(mercuryResponse.data);
            return parsedEntries;
        } else {
            throw new Error("Error getting pair addresses")
        }
};

    async getAllPools() {
        //const res = await this.saveMercuryPairsCount(12);
        const newCounter = await this.getPairCounter();
        const oldCounter = await this.getMercuryPairsCount();
        if (newCounter > oldCounter) {
            console.log('New pairs found')
            this.subscribeToPairsOnFactory(oldCounter, newCounter);
            console.log('Subscribed to new pairs on factory')
            const addresses = await this.getPairAddresses();
            const newAddresses = addresses.slice(oldCounter, newCounter);
            this.subscribeToPairs({ 
                contractId: newAddresses, 
                keyXdr: "AAAAFA==", 
                durability: "persistent", 
                hydrate: true 
            });
            console.log('Subscribed to new pairs')
            this.saveMercuryPairsCount(newCounter);
            console.log('Updated pairs count on database')
            console.log('Fetching Liquidity pools...')
            const pools = await this.getPairWithTokensAndReserves(newAddresses);
            console.log('done')
            return pools;
        } else {
            console.log('No new pairs found')
            const addresses = await this.getPairAddresses();
            console.log('Fetching Liquidity pools...')
            const pools = await this.getPairWithTokensAndReserves(addresses);
            console.log('done')
            return pools;
        }
    }
}