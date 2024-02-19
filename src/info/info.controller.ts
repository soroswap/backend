import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { ApiHeader, ApiOkResponse } from '@nestjs/swagger';

import { NetworkApiQuery } from 'src/decorators';
import { InfoService } from './info.service';

import { QueryNetworkDto } from 'src/dto';

@ApiHeader({
  name: 'apiKey',
  description: 'API Key',
})
@Controller('info')
export class InfoController {
  constructor(private readonly infoService: InfoService) {}

  @Get('hello')
  getHello() {
    return 'Hello world';
  }
}
