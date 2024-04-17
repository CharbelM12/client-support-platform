import { IsEmail, IsNumber, IsString, Max, Min } from 'class-validator';

export class ForgotPassword {
  @IsString()
  @IsEmail()
  email: string;
}
export class ValidateOtp {
  @IsNumber()
  @Min(1000)
  @Max(9999)
  otp: number;

  @IsString()
  verificationToken: string;
}
export class ResetPassword {
  @IsNumber()
  @Min(1000)
  @Max(9999)
  otp: number;
  @IsString()
  verificationToken: string;
  @IsString()
  newPassword: string;
}
