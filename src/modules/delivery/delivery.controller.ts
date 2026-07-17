import { Body, Controller, Post } from '@nestjs/common';
import { DeliveryService } from './delivery.service.js';
import { CalculateDeliveryDto } from './dto/calculate-delivery.dto.js';
import { CalculateDeliveryResponseDto } from './dto/delivery-option.dto.js';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post('calculate')
  async calculate(
    @Body() dto: CalculateDeliveryDto,
  ): Promise<CalculateDeliveryResponseDto> {
    const options = await this.deliveryService.calculateForAllProviders({
      basket: dto.basket,
      address: dto.address,
    });

    return { options };
  }
}
