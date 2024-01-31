import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PairsService } from 'src/pairs/pairs.service';
import { AllPoolsRequestBodyDto, AllPoolsResponseDto } from './dto/pools.dto';

const allPools = {
    pools:[
        {
            "token0": "CKL2NBVVBU7N6BYO2GVNPZCOCZMDAU2EJC5DM5E7R6AKBKTLNFW4BD",
            "token1": "CQWEM34J34WSVJEI2CPXDKBL7JZX34CXI47Y57NUPAVZZXYGBXPDNF4N",
            "reserve0": "20000",
            "reserve1":"199453",
        },
        {
            "token0": "CBUHSDNBVVBU7N6BYO2GVNPZCOCZMDAU2EJC5DM5E7R6AKBKTLNFW4BD",
            "token1": "CCR3M34J34WSVJEI2CPXDKBL7JZX34CXI47Y57NUPAVZZXYGBXPDNF4N",
            "reserve0": "10000",
            "reserve1":"3453453",
        },
        {
            "token0": "CJUHSDNBVVBU7N6BYO2GVNPZCOCZMDAU2EJC5DM5E7R6AKBKTLNFW4BD",
            "token1": "CJR3M34J34WSVJEI2CPXDKBL7JZX34CXI47Y57NUPAVZZXYGBXPDNF4N",
            "reserve0": "10000",
            "reserve1":"3453453"
        },
    ]
}

@Injectable()
export class PoolsService {
    constructor(
        private prismaService: PrismaService,
        private pairsService: PairsService
    ) {}
    findAll() { 
        return allPools.pools;
    }

    async getAllPools(body: AllPoolsRequestBodyDto): Promise<AllPoolsResponseDto> {
        const newCounter = await this.pairsService.getPairCounter();
        const addressess = body.addresses;
        const oldCounter = await this.pairsService.getMercuryPairsCount();
        if( newCounter > oldCounter) {
            console.log('New pairs found');
            this.pairsService.saveMercuryPairsCount(newCounter);
        }
        return allPools
    }
}
