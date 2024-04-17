import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtToken {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  generateAccessToken(payload: object) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('tokens.accessTokenSecret'),
      expiresIn: this.configService.get('tokens.accessTokenExpiry'),
    });
    return accessToken;
  }
}
