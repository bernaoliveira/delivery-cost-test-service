import { Test } from '@nestjs/testing';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { DELIVERY_PROVIDERS_INJECT_KEY } from './providers/constants';
import { MockCdekProvider } from './providers/cdek/cdek.provider';
import { MockBoxberryProvider } from './providers/boxberry/boxberry.provider';
import { CalculateDeliveryDto } from './dto/calculate-delivery.dto';

describe('DeliveryController', () => {
  let controller: DeliveryController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [DeliveryController],
      providers: [
        DeliveryService,
        {
          provide: DELIVERY_PROVIDERS_INJECT_KEY,
          useFactory: () => [
            new MockCdekProvider(),
            new MockBoxberryProvider(),
          ],
        },
      ],
    }).compile();

    controller = module.get(DeliveryController);
  });

  it('should return delivery options from all providers', async () => {
    const dto: CalculateDeliveryDto = {
      basket: {
        weight: 2,
        dimensions: { length: 30, width: 20, height: 15 },
        total: 1000,
      },
      address: {
        addressLine1: 'ул. Ленина, 1',
        city: 'Москва',
        zipCode: '101000',
      },
    };

    const result = await controller.calculate(dto);

    expect(result.options).toHaveLength(2);
    expect(result.options.find((o) => o.providerId === 'cdek')?.price).toBe(
      200,
    );
    expect(result.options.find((o) => o.providerId === 'boxberry')?.price).toBe(
      300,
    );
  });
});
