import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BasketDto } from '../../../common/dto/basket.dto';
import { AddressDto } from '../../../common/dto/address.dto';

export class CalculateDeliveryDto {
  @ValidateNested()
  @Type(() => BasketDto)
  basket: BasketDto;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
