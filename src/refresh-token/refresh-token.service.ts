import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshToken } from './refreshToken.model';
import mongoose, { Model } from 'mongoose';
import * as randomString from 'randomstring';
import { JwtToken } from 'src/utils/jwt.utils';
import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import errorMessages from 'errorMessages';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
    private readonly jwtToken: JwtToken,
    private configService: ConfigService,
  ) {}
  async refreshToken(reqBody: RefreshTokenDto) {
    const foundToken = await this.refreshTokenModel.findOne({
      refreshToken: reqBody.refreshToken,
      expirationDate: { $gt: moment() },
    });
    if (!foundToken) {
      throw new HttpException(
        errorMessages.refreshTokenNotFound,
        HttpStatus.UNAUTHORIZED,
      );
    } else {
      const refreshToken = randomString.generate();
      const accessToken = this.jwtToken.generateAccessToken({
        userId: foundToken.userId,
      });
      const accessTokenExpiry = moment()
        .add(
          this.configService.get(
            'momentAddParams.duration',
          ) as moment.DurationInputArg1,
          this.configService.get(
            'momentAddParams.unit',
          ) as moment.DurationInputArg2,
        )
        .toDate();
      await this.addRefreshToken(refreshToken, foundToken.userId, accessToken);
      return {
        refreshToken: refreshToken,
        accessToken: accessToken,
        accessTokenExpiry: accessTokenExpiry,
        userId: foundToken.userId,
      };
    }
  }
  // this function is used in the refresh token function and in the login function to add store the refresh token in the database
  async addRefreshToken(
    refreshToken: string,
    userId: mongoose.Types.ObjectId,
    accessToken: string,
  ) {
    await this.refreshTokenModel.updateOne(
      { userId: userId },
      { $set: { refreshToken: refreshToken, accessToken: accessToken } },
      { upsert: this.configService.get<boolean>('upsertValue') },
    );
  }
}
