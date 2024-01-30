import { Controller } from '@nestjs/common';
  import { PairsService } from '../services/pairs.service';   
  @Controller('admins')
  export class PairsController {
    constructor(private readonly pairsService: PairsService) {}

  }