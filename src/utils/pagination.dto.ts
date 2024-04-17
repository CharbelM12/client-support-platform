import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class paginationQuery {
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  page?: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  limit?: number;
}
