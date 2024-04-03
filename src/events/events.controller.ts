import { Body, Controller, Post, Query, Param } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { QueryNetworkDto } from 'src/dto';
import { getPairEventsDto, getRouterEventsDto } from './dto/events.dto';
import { EventsService } from './events.service';

@ApiHeader({
  name: 'apiKey',
  description: 'API Key',
})
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('router')
  async soroswapRouterEvents(
    @Query() query: QueryNetworkDto,
    @Body() body: getRouterEventsDto,
  ) {
    return this.eventsService.getRouterEvents(query.network, body);
  }

  @Post('pool/:pool')
  async getPoolEvents(
    @Query() query: QueryNetworkDto,
    @Param('pool') pool: string,
    @Body() body: getPairEventsDto,
  ) {
    return this.eventsService.getPoolEvents(query.network, pool, body);
  }
}
