import { Injectable } from '@nestjs/common';
import { Network } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { selectMercuryInstance } from 'src/services/mercury';
import { getRouterAddress } from 'src/utils';
import {
  eventsByContractIdAndTopicParser,
  pairEventsParser,
} from 'src/utils/parsers/getContractEventsParser';
import { GET_EVENTS_BY_CONTRACT_AND_TOPIC } from 'src/utils/queries';
import { getRouterEventsDto } from './dto/events.dto';
import { routerEventsParser } from 'src/utils/parsers/routerEventsParser';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

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

    const parsedContractEvents = await eventsByContractIdAndTopicParser(
      network,
      mercuryResponse.data!,
    );

    return routerEventsParser(parsedContractEvents);
  }

  async getPoolEvents(pool: string, network: Network) {
    const mercuryInstance = selectMercuryInstance(network);
    const mercuryResponse = await mercuryInstance.getCustomQuery({
      request: GET_EVENTS_BY_CONTRACT_AND_TOPIC,
      variables: {
        contractId: pool,
      },
    });
    const parsedContractEvents = await pairEventsParser(
      network,
      mercuryResponse.data!,
    );
    console.log(JSON.stringify(parsedContractEvents, null, 2));
    return parsedContractEvents;
  }
}
