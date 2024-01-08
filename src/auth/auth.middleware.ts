import { Injectable, NestMiddleware } from '@nestjs/common';
import * as passport from 'passport';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    passport.authenticate('headerapikey', (value) => {
      if (value) {
        next();
      } else {
        res.status(401).json({ message: 'Unauthorized' });
      }
    })(req, res, next);
  }
}
