import { Controller, Post, Body } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenDto } from './dto/refreshToken.dto';

@Controller('refresh-token')
export class RefreshTokenController {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  @Post()
  refreshToken(@Body() reqBody: RefreshTokenDto) {
    return this.refreshTokenService.refreshToken(reqBody);
  }
}
