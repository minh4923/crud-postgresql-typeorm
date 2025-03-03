import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedRequest} from '../../../common/interfaces/authenticated-request';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (authHeader) {
      const token = authHeader.split(' ')[1];

      try {
        const payload = this.jwtService.verify(token);
        req.user = payload;
      } catch (error) {
        console.log('JWT no', error.message);
      }
    }

    next();
  }
}
