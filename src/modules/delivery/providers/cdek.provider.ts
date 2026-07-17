import { DeliveryProvider } from '../interfaces/delivery-provider.interface.js';
import { CalculateDeliveryDto } from '../dto/calculate-delivery.dto.js';
import { DeliveryOption } from '../interfaces/delivery-option.interface.js';

export class MockCdekProvider implements DeliveryProvider {
  readonly id = 'cdek';
  readonly name = 'СДЭК';
  readonly timeoutMs = 500;

  private readonly pricePerKg = 100;

  async calculate(request: CalculateDeliveryDto): Promise<DeliveryOption[]> {
    const price = Math.round(request.basket.weight * this.pricePerKg);

    return [
      {
        providerId: this.id,
        providerName: this.name,
        price,
        currency: 'RUB',
        estimatedDays: { min: 2, max: 4 },
      },
    ];
  }
}
