import { Injectable } from '@nestjs/common';
import { Network } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { selectMercuryInstance } from 'src/services/mercury';
import { getRouterAddress } from 'src/utils';
import { eventsByContractIdAndTopicParser } from 'src/utils/parsers/getContractEventsParser';
import { GET_EVENTS_BY_CONTRACT_AND_TOPIC } from 'src/utils/queries';
import { getRouterEventsDto } from './dto/events.dto';

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

    const parsedContractEvents = eventsByContractIdAndTopicParser(
      mercuryResponse.data!,
    );

    return parsedContractEvents;
  }
}
