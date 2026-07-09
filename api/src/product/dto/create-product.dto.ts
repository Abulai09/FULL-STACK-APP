import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Transform(({ value }) => Number(value)) // ✅ строку → число
  @IsNumber()
  @Min(0)
  price: number;

  @Transform(({ value }) => Number(value)) // ✅ строку → число
  @IsNumber()
  @Min(0)
  stock: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
