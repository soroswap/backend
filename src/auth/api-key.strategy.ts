import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { AuthService } from './auth.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy) {
  constructor(private authService: AuthService) {
    super({ header: 'apiKey', prefix: '' }, true, async (apikey, done) => {
      const isValid = this.authService.validateApiKey(apikey);
      if (!isValid) {
        return done(false);
      }
      return done(true);
    });
  }
}
