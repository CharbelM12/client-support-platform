import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp } from './otp.model';
import { ForgotPassword, ResetPassword, ValidateOtp } from './dto/otp.dto';
import * as moment from 'moment';
import { UserService } from 'src/user/user.service';
import * as randomString from 'randomstring';
import { Email } from 'src/utils/email.utils';
import { ConfigService } from '@nestjs/config';
import errorMessages from 'errorMessages';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(Otp.name) private readonly otpModel: Model<Otp>,
    private readonly userService: UserService,
    private emailSender: Email,
    private readonly configService: ConfigService,
  ) {}

  async forgotPassword(reqBody: ForgotPassword) {
    const user = await this.userService.findUserByEmail(reqBody.email);
    if (!user) {
      return;
    } else {
      await this.userService.checkIsActivated(user._id);
      await this.userService.checkIsLocked(user._id);
      const userOtp = {
        otpType: this.configService.get<string>('otp.type'),
        otp: randomString.generate({
          length: this.configService.get<number>('otp.length'),
          charset: this.configService.get<string>('otp.charset'),
        }),
        otpExpires: moment().add(
          this.configService.get<number>(
            'momentAddParams.duration',
          ) as moment.DurationInputArg1,
          this.configService.get<string>(
            'momentAddParams.unit',
          ) as moment.DurationInputArg2,
        ),
        otpLastSendDate: moment(),
        userId: user._id,
        verificationToken: randomString.generate(
          this.configService.get<string>('verificationToken.format'),
        ),
      };
      const foundOtp = await this.otpModel.findOne({ userId: user._id });
      if (
        foundOtp?.retryCount >=
        this.configService.get<number>('retryCount.maxValue')
      ) {
        await this.userService.lockUser(reqBody.email);
        await this.otpModel.updateOne(
          { userId: user._id },
          {
            $set: {
              retryCount: this.configService.get<number>(
                'retryCount.defaultValue',
              ),
            },
          },
        );
        throw new HttpException(
          errorMessages.lockedAccount,
          HttpStatus.UNAUTHORIZED,
        );
      } else {
        await this.otpModel.updateOne(
          { userId: user._id },
          {
            $set: userOtp,
            $inc: {
              retryCount: this.configService.get<number>(
                'retryCount.incrementValue',
              ),
            },
          },
          { upsert: this.configService.get<boolean>('upsertValue') },
        );
        return await this.sendEmail(reqBody.email, userOtp.otp);
      }
    }
  }
  async resendOtp(reqBody: ForgotPassword) {
    const user = await this.userService.findUserByEmail(reqBody.email);
    await this.userService.checkIsActivated(user._id);
    await this.userService.checkIsLocked(user._id);
    const userOtp = await this.otpModel.findOne({ userId: user._id });

    if (
      userOtp?.retryCount >=
      this.configService.get<number>('retryCount.maxValue')
    ) {
      await this.userService.lockUser(reqBody.email);
      await this.otpModel.updateOne(
        { userId: user._id },
        {
          $set: {
            retryCount: this.configService.get<number>(
              'retryCount.defaultValue',
            ),
          },
        },
      );
      throw new HttpException(
        errorMessages.lockedAccount,
        HttpStatus.UNAUTHORIZED,
      );
    } else {
      const newOtp = {
        otp: randomString.generate({
          length: this.configService.get<number>('otp.length'),
          charset: this.configService.get<string>('otp.charset'),
        }),
        otpExpires: moment().add(
          this.configService.get<number>(
            'momentAddParams.duration',
          ) as moment.DurationInputArg1,
          this.configService.get<string>(
            'momentAddParams.unit',
          ) as moment.DurationInputArg2,
        ),
        otpLastSendDate: moment(),
        verificationToken: randomString.generate(
          this.configService.get<string>('verificationToken.format'),
        ),
      };
      await this.otpModel.updateOne(
        { userId: user._id },
        {
          $set: newOtp,
          $inc: {
            retryCount: this.configService.get<number>(
              'retryCount.incrementValue',
            ),
          },
        },
      );
      return await this.sendEmail(reqBody.email, newOtp.otp);
    }
  }
  async validateOtp(reqBody: ValidateOtp) {
    const foundOtp = await this.otpModel.findOne({
      otp: reqBody.otp,
      verificationToken: reqBody.verificationToken,
      otpExpires: { $gt: moment() },
    });
    if (!foundOtp) {
      throw new HttpException(
        errorMessages.invalidOtp,
        HttpStatus.UNAUTHORIZED,
      );
    } else {
      await this.userService.checkIsActivated(foundOtp.userId);
      await this.userService.checkIsLocked(foundOtp.userId);
      await this.otpModel.updateOne(
        { _id: foundOtp._id },
        {
          $set: {
            retryCount: this.configService.get<number>(
              'retryCount.defaultValue',
            ),
          },
        },
      );
      return;
    }
  }
  async resetPassword(reqBody: ResetPassword) {
    const otp = await this.otpModel.findOne({
      otp: reqBody.otp,
      verificationToken: reqBody.verificationToken,
      otpExpires: { $gt: moment() },
    });
    if (!otp) {
      throw new HttpException(
        errorMessages.invalidOtp,
        HttpStatus.UNAUTHORIZED,
      );
    } else {
      await this.userService.checkIsActivated(otp.userId);
      await this.userService.checkIsLocked(otp.userId);
      await this.userService.resetPassword(otp.userId, reqBody.newPassword);
    }
  }
  async sendEmail(email: string, otp: string) {
    const mailOptions = {
      from: this.configService.get<string>('mailOptions.from'),
      to: email,
      subject: 'Forgot Password',
      html: `<p>Use the following code to change your password: <strong>${otp}</strong></p>`,
    };
    return await this.emailSender.sendEmail(mailOptions);
  }
}
