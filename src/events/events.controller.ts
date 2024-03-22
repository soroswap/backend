import { Body, Controller, Post, Query } from '@nestjs/common';
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

  @Post('router')
  async soroswapRouterEvents(
    @Query() query: QueryNetworkDto,
    @Body() body: getRouterEventsDto,
  ) {
    return await this.eventsService.getRouterEvents(query.network, body);
  }
}
