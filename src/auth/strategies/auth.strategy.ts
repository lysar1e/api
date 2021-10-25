import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, 'auth') {
  constructor() {
    super({
      ignoreExpiration: true,
      secretOrKey: 'access',
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request.cookies['access'];
        },
      ]),
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
