import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import mongoose from 'mongoose';

export class ComplaintDto {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  categoryIds: mongoose.Types.ObjectId[];
}
export class UpdateStatusDto {
  @IsString()
  @IsIn(['PENDING', 'INPROGRESS', 'RESOLVED', 'REJECTED'])
  status: string;
}
export class filterDTO {
  @IsOptional()
  @IsMongoId()
  userId?: mongoose.Types.ObjectId;

  @IsOptional()
  @IsString()
  @IsIn(['pending', 'INPROGRESS', 'RESOLVED', 'REJECTED'])
  status?: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  page?: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  limit?: number;
}
export class QueryDto {
  createdBy?: mongoose.Types.ObjectId;
  status?: string;
}
