import { IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DimensionsDto } from '../../modules/delivery/dto/dimensions.dto';

export class BasketDto {
  @IsNumber()
  weight: number;

  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions: DimensionsDto;

  @IsNumber()
  total: number;
}
