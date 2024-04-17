import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { OtpService } from './otp.service';
import { ForgotPassword, ResetPassword, ValidateOtp } from './dto/otp.dto';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}
  @Post('forgot-password')
  async forgotPassword(@Body() reqBody: ForgotPassword) {
    await this.otpService.forgotPassword(reqBody);
  }
  @Post('resend')
  async resendOtp(@Body() reqBody: ForgotPassword) {
    return await this.otpService.resendOtp(reqBody);
  }
  @Put('validate')
  async validateOtp(@Body() reqBody: ValidateOtp) {
    return await this.otpService.validateOtp(reqBody);
  }
  @Put('reset-password')
  async resetPassword(@Body() reqBody: ResetPassword) {
    return await this.otpService.resetPassword(reqBody);
  }
}
