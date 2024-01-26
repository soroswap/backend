
import { Mercury, factoryInstanceParser } from 'mercury-sdk';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { GET_LAST_CONTRACT_ENTRY } from './queries/getLatestContractEntry';
import getFactoryAddress from './getFactoryAddress';


export async function getPairCounter(mercuryInstance:Mercury) {
    const contractId = getFactoryAddress();
    const mercuryResponse = await mercuryInstance.getCustomQuery({ request: GET_LAST_CONTRACT_ENTRY, variables: { contractId } })
    .catch((err: any) => {
        console.log(err)
    })

    if (mercuryResponse && mercuryResponse.ok) {
        const parsedEntry = factoryInstanceParser(mercuryResponse.data);
        return parsedEntry[0].allPairs.length;
    }
    
}