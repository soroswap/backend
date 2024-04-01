import { Injectable } from '@nestjs/common';
import { Network } from '@prisma/client';
import { InfoService } from 'src/info/info.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { selectMercuryInstance } from 'src/services/mercury';
import { getRouterAddress } from 'src/utils';
import { createVariablesForPairsTokensAndReserves } from 'src/utils/createVariablesForPairsTokensAndReserves';
import { soroswapPairInstanceParser } from 'src/utils/parsers';
import {
  eventsByContractIdAndTopicParser,
  pairEventsFormatter,
  pairEventsParser,
} from 'src/utils/parsers/getContractEventsParser';
import { routerEventsFormatter } from 'src/utils/parsers/routerEventsFormatter';
import {
  GET_EVENTS_BY_CONTRACT_AND_TOPIC,
  buildGetPairWithTokensAndReservesQuery,
} from 'src/utils/queries';
import { getPairEventsDto, getRouterEventsDto } from './dto/events.dto';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private infoService: InfoService,
  ) {}

  async getRouterEvents(network: Network, routerEventsDto: getRouterEventsDto) {
    const mercuryInstance = selectMercuryInstance(network);

    const routerAddress = await getRouterAddress(network);

    const mercuryResponse = await mercuryInstance.getCustomQuery({
      request: GET_EVENTS_BY_CONTRACT_AND_TOPIC,
      variables: {
        contractId: routerAddress,
        t2: routerEventsDto.topic2,
        first: routerEventsDto.first,
        last: routerEventsDto.last,
        offset: routerEventsDto.offset,
        before: routerEventsDto.before,
        after: routerEventsDto.after,
      },
    });
    const tokensList = await this.infoService.fetchTokensList(network);
    const parsedContractEvents = await eventsByContractIdAndTopicParser(
      network,
      mercuryResponse.data!,
      tokensList,
      this.infoService.getTokenData,
    );

    return routerEventsFormatter(parsedContractEvents);
  }

  async getPoolEvents(
    network: Network,
    poolAddress: string,
    pairEventsDto: getPairEventsDto,
  ) {
    const mercuryInstance = selectMercuryInstance(network);
    const eventsMercuryResponse = await mercuryInstance.getCustomQuery({
      request: GET_EVENTS_BY_CONTRACT_AND_TOPIC,
      variables: {
        contractId: poolAddress,
        t2: pairEventsDto.topic2,
      },
    });

    const parsedContractEvents = await pairEventsParser(
      network,
      eventsMercuryResponse.data!,
    );

    const query = buildGetPairWithTokensAndReservesQuery(1);
    const variables = createVariablesForPairsTokensAndReserves([poolAddress]);

    const mercuryResponse = await mercuryInstance
      .getCustomQuery({ request: query, variables })
      .catch((err: any) => {
        console.log(err);
      });

    let tokenAddressA = '';
    let tokenAddressB = '';

    if (mercuryResponse && mercuryResponse.ok) {
      const parsedEntries = soroswapPairInstanceParser(mercuryResponse.data);
      tokenAddressA = parsedEntries?.[0]?.token0;
      tokenAddressB = parsedEntries?.[0]?.token1;
    }
    const tokensList = await this.infoService.fetchTokensList(network);

    return pairEventsFormatter(
      parsedContractEvents,
      tokenAddressA,
      tokenAddressB,
      tokensList,
      this.infoService.getTokenData,
    );
  }
}
