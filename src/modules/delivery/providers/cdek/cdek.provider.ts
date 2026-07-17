import { DeliveryProvider } from '../../interfaces/delivery-provider.interface';
import { CalculateDeliveryDto } from '../../dto/calculate-delivery.dto';
import { DeliveryOption } from '../../interfaces/delivery-option.interface';

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
