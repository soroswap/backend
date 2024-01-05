import { ApiOkResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { NetworkApiQuery } from './decorators';
import {
  QueryNetworkDto,
  OptimalRouteRequestBodyDto,
  OptimalRouteResponseDto,
} from './dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOkResponse({
    description: 'Returns a message',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
      },
    },
  })
  @Get('/hello')
  getHello(): { message: string } {
    return this.appService.getHello();
  }

  @ApiOkResponse({
    description: 'Returns the optimal route',
    type: OptimalRouteResponseDto,
  })
  @NetworkApiQuery()
  @Post('/optimal_route')
  getOptimalRoute(
    @Query() query: QueryNetworkDto,
    @Body() body: OptimalRouteRequestBodyDto,
  ): OptimalRouteResponseDto {
    return this.appService.getOptimalRoute(query.network, body);
  }

  @NetworkApiQuery()
  @Get('/asset_info')
  getAssetInfo(@Query() query: QueryNetworkDto): {
    network: string;
  } {
    return { network: query.network };
  }

  @NetworkApiQuery()
  @Get('/last_trades')
  getLastTrades(@Query() query: QueryNetworkDto): {
    network: string;
  } {
    return { network: query.network };
  }

  @NetworkApiQuery()
  @Get('/info')
  getInfo(@Query() query: QueryNetworkDto): {
    network: string;
  } {
    return { network: query.network };
  }
}
