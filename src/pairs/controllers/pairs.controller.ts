import { Controller, Get, Post } from '@nestjs/common';
import { PairsService } from '../services/pairs.service';

@Controller('pairs')
export class PairsController {
  constructor(private readonly pairsService: PairsService) { }
  @Get()
  async findAll() {
    return await this.pairsService.findAllPairs();
  }

  @Post()
  async subscribeToPairs() {
    return await this.pairsService.subscribeToPairs();
  }
}