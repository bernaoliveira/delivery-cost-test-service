import { IsOptional, IsString } from 'class-validator';

export class AddressDto {
  @IsString()
  addressLine1: string;

  @IsString()
  @IsOptional()
  addressLine2?: string;

  @IsString()
  city: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  zipCode: string;
}
