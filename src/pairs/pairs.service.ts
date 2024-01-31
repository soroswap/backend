import { BadRequestException, Injectable } from '@nestjs/common';
import { Mercury } from 'mercury-sdk'
import { getFactoryAddress } from 'src/utils/getFactoryAddress';
import { subscribeToLedgerEntriesDto } from '../dto/subscribe.dto';
import { factoryInstanceParser } from '../../utils/parsers/factoryInstanceParser';
import { GET_LAST_CONTRACT_ENTRY } from '../../utils/queries/getLastContractEntry';
import { PrismaService } from 'src/prisma/prisma.service';
import { get } from 'http';


const mercuryInstance = new Mercury({
    backendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT,
    graphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT,
    email: process.env.MERCURY_TESTER_EMAIL,
    password: process.env.MERCURY_TESTER_PASSWORD,
});

@Injectable()
export class PairsService {
    constructor(
        private prisma: PrismaService
    ) {
    }
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
        if (factoryEntries && factoryEntries.ok) {
            console.log(factoryEntries.data.entryUpdateByContractId.edges)
            const parsedEntries: any = factoryInstanceParser(factoryEntries.data)
            return parsedEntries;
        }
    }

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
     * Function to get the total number of pairs created by the factory.
     * @param mercuryInstance The Mercury instance to be used to make the request.
     * @returns The total number of pairs created by the factory.
     */
    async getPairCounter(mercuryInstance: Mercury) {
        const contractId = await getFactoryAddress();
        const mercuryResponse = await mercuryInstance.getCustomQuery({ request: GET_LAST_CONTRACT_ENTRY, variables: { contractId, ledgerKey: "AAAAFA==" } })
            .catch((err: any) => {
                console.log(err)
            })

        if (mercuryResponse && mercuryResponse.ok) {
            const parsedEntry = factoryInstanceParser(mercuryResponse.data);
            if (parsedEntry.length === 0) {
                return 0;
            }
            return parsedEntry[0].totalPairs;
        }
    }

    /**
     * Saves the count of Mercury pairs.
     * @returns The saved counter object.
     */
    async saveMercuryPairsCount() {
        const counter = await this.prisma.counter.upsert({
            where: {
                id: 1
            },
            update: {
                count: await this.getPairCounter(mercuryInstance)
                //count: await this.getPairCounter(mercuryInstance)
            },
            create: {
                count: await this.getPairCounter(mercuryInstance)
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
}