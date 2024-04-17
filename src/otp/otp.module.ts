import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, otpSchema } from './otp.model';
import { UserModule } from 'src/user/user.module';
import { Email } from 'src/utils/email.utils';
import otpConfig from './otp.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Otp.name, schema: otpSchema }]),
    UserModule,
    ConfigModule.forRoot({
      cache: true,
      load: [otpConfig],
    }),
  ],
  controllers: [OtpController],
  providers: [OtpService, Email],
})
export class OtpModule {}
