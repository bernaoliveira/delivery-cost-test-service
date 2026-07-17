import { DeliveryProvider } from '../../interfaces/delivery-provider.interface';
import { CalculateDeliveryDto } from '../../dto/calculate-delivery.dto';
import { DeliveryOption } from '../../interfaces/delivery-option.interface';

export class MockBoxberryProvider implements DeliveryProvider {
  readonly id = 'boxberry';
  readonly name = 'Boxberry';
  readonly timeoutMs = 500;

  private readonly cityPrices: Record<string, number> = {
    Москва: 300,
    Казань: 500,
  };

  private readonly defaultPrice = 700;

  async calculate(request: CalculateDeliveryDto): Promise<DeliveryOption[]> {
    const price = this.cityPrices[request.address.city] ?? this.defaultPrice;

    return [
      {
        providerId: this.id,
        providerName: this.name,
        price,
        currency: 'RUB',
        estimatedDays: { min: 3, max: 5 },
      },
    ];
  }
}
