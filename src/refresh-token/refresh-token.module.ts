import { Module } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenController } from './refresh-token.controller';
import { RefreshToken, refreshTokenSchema } from './refreshToken.model';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtToken } from 'src/utils/jwt.utils';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: refreshTokenSchema },
    ]),
  ],
  controllers: [RefreshTokenController],
  providers: [RefreshTokenService, JwtToken],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
