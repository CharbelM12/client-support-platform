import { OmitType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsEmail,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import mongoose from 'mongoose';

export class SignupDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsBoolean()
  @IsOptional()
  isVip?: boolean;
}
export class LoginDto extends OmitType(SignupDto, [
  'firstName',
  'lastName',
  'isVip',
]) {}
export class addCMSUserDto extends OmitType(SignupDto, ['password']) {}

export class MakeCmsAdmin {
  @IsMongoId()
  userId: mongoose.Types.ObjectId;
}
export class ChangePassword {
  @IsString()
  currentPassword: string;

  @IsString()
  newPassword: string;
}
