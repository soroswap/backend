import { Body, Controller, Get, Post } from '@nestjs/common';
import { PairsService } from '../services/pairs.service';
import { subscribeToLedgerEntriesDto } from '../dto/subscribe.dto';

@Controller('pairs')
export class PairsController {
  constructor(private readonly pairsService: PairsService) { }
  @Get()
  async findAll() {
    return await this.pairsService.findAllPairs();
  }

  @Post()
  async subscribeToPairs(@Body() body: subscribeToLedgerEntriesDto) {
    return await this.pairsService.subscribeToPairs(body);
  }

  @Get('count')
  async getPairsCount() {
    return await this.pairsService.getMercuryPairsCount();
  }
}