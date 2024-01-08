import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get('apiKey');
  }

  validateApiKey(apiKey: string): boolean {
    return apiKey === this.apiKey;
  }
}
