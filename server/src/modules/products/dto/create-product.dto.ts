import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsNumber()
  price!: number;

  @IsString()
  @IsNotEmpty()
  unit!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
