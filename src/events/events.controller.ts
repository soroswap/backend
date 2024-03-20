import { Body, Controller, Get, Query } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { QueryNetworkDto } from 'src/dto';
import { getRouterEventsDto } from './dto/events.dto';
import { EventsService } from './events.service';

@ApiHeader({
  name: 'apiKey',
  description: 'API Key',
})
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('router')
  async soroswapRouterEvents(
    @Query() query: QueryNetworkDto,
    @Body() body: getRouterEventsDto,
  ) {
    return this.eventsService.getRouterEvents(query.network, body);
  }
}
