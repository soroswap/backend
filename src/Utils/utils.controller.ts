import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import {
  ApiBody,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { QueryNetworkDto } from 'src/dto';
import { UtilsService } from './utils.service';
import { fetchPathsDto } from './dto/fetchPaths.dto';

@ApiHeader({
  name: 'apiKey',
  description: 'API Key required for authentication',
})
@Controller('utils')
export class UtilsController {
  constructor(private readonly utilsService: UtilsService) {}

  @Post('/paths')
  @ApiOperation({
    summary: 'Get paths between two tokens',
    description: 'Retrieve all possible paths between two tokens',
  })
  @ApiQuery({ name: 'network', description: '<MAINNET | TESTNET>' })
  //@ApiBody({ type: fetchPathsDto })
  async fetchPaths(
    @Query() query: QueryNetworkDto,
    @Body() body: fetchPathsDto,
  ) {
    return await this.utilsService.fetchPaths(
      query.network,
      body,
    );
  }
}
