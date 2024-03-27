import { Body, Controller, Post, Query, Get, Param } from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
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
    return this.eventsService.getRouterEvents(query.network, body);
  }

  @Get('pool/:pool')
  @ApiOperation({
    summary: 'Get pool events',
    description: 'Retrieve all events for a Liquidity Pool',
  })
  @ApiParam({
    name: 'pool',
    description: 'Liquidity Pool address',
    type: String,
  })
  @ApiOkResponse({
    description:
      'Array with all events for the Liquidity Pool. Empty array if no events found.',
  })
  async getPoolEvents(
    @Query() query: QueryNetworkDto,
    @Param('pool') pool: string,
  ) {
    return await this.eventsService.getPoolEvents(pool, query.network);
  }
}
