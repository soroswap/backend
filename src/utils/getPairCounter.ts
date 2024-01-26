
import { Mercury, factoryInstanceParser } from 'mercury-sdk';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { GET_CONTRACT_ENTRIES } from './queries/getContractEntries';

const contractId = process.env.FACTORY_CONTRACT_ID;

export async function getPairCounter(mercuryInstance:Mercury) {
    const mercuryResponse = await mercuryInstance.getCustomQuery({ request: GET_CONTRACT_ENTRIES, variables: { contractId } })
    .catch((err: any) => {
        console.log(err)
    })

    if (mercuryResponse && mercuryResponse.ok) {
        const parsedEntries = factoryInstanceParser(mercuryResponse.data);
        // return parsedEntries[0].allPairs.length;
        return parsedEntries;
    }
}