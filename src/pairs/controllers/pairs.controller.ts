import { Controller, Get } from '@nestjs/common';
import { PairsService } from '../services/pairs.service';

@Controller('pairs')
export class PairsController {
  constructor(private readonly pairsService: PairsService) { }
  @Get()
  async findAll() {
    return await this.pairsService.findAllPairs();
  }
}