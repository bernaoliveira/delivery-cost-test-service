import { Logger } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryProvider } from './interfaces/delivery-provider.interface';
import { DeliveryOption } from './interfaces/delivery-option.interface';
import { CalculateDeliveryDto } from './dto/calculate-delivery.dto';

jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {
});

describe('DeliveryService', () => {
  const request: CalculateDeliveryDto = {
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

  const createProvider = (
    id: string,
    result: ReturnType<DeliveryProvider['calculate']>,
    timeoutMs = 500,
  ): DeliveryProvider => ({
    id,
    name: id,
    timeoutMs,
    calculate: jest.fn().mockReturnValue(result),
  });

  it('should aggregate results from all providers', async () => {
    const providers = [
      createProvider(
        'a',
        Promise.resolve([
          {
            providerId: 'a',
            providerName: 'A',
            price: 100,
            currency: 'RUB',
            estimatedDays: { min: 1, max: 2 },
          },
        ]),
      ),
      createProvider(
        'b',
        Promise.resolve([
          {
            providerId: 'b',
            providerName: 'B',
            price: 200,
            currency: 'RUB',
            estimatedDays: { min: 3, max: 5 },
          },
        ]),
      ),
    ];

    const service = new DeliveryService(providers);
    const options = await service.calculateForAllProviders(request);

    expect(options).toHaveLength(2);
    expect(options[0].providerId).toBe('a');
    expect(options[1].providerId).toBe('b');
  });

  it('should skip failed providers and return successful ones', async () => {
    const providers = [
      createProvider(
        'ok',
        Promise.resolve([
          {
            providerId: 'ok',
            providerName: 'OK',
            price: 100,
            currency: 'RUB',
            estimatedDays: { min: 1, max: 2 },
          },
        ]),
      ),
      createProvider('fail', Promise.reject(new Error('Provider down'))),
    ];

    const service = new DeliveryService(providers);
    const options = await service.calculateForAllProviders(request);

    expect(options).toHaveLength(1);
    expect(options[0].providerId).toBe('ok');
  });

  it('should return empty array when all providers fail', async () => {
    const providers = [
      createProvider('fail1', Promise.reject(new Error('down'))),
      createProvider('fail2', Promise.reject(new Error('timeout'))),
    ];

    const service = new DeliveryService(providers);
    const options = await service.calculateForAllProviders(request);

    expect(options).toEqual([]);
  });

  it('should call all providers with the request', async () => {
    const providers = [
      createProvider('a', Promise.resolve([])),
      createProvider('b', Promise.resolve([])),
    ];

    const service = new DeliveryService(providers);
    await service.calculateForAllProviders(request);

    expect(providers[0].calculate).toHaveBeenCalledWith(request);
    expect(providers[1].calculate).toHaveBeenCalledWith(request);
  });

  it('should skip provider that exceeds timeoutMs', async () => {
    const slow = createProvider(
      'slow',
      new Promise<DeliveryOption[]>(() => {
      }),
      10,
    );
    const fast = createProvider(
      'fast',
      Promise.resolve([
        {
          providerId: 'fast',
          providerName: 'Fast',
          price: 50,
          currency: 'RUB',
          estimatedDays: { min: 1, max: 1 },
        },
      ]),
    );

    const service = new DeliveryService([slow, fast]);
    const options = await service.calculateForAllProviders(request);

    expect(options).toHaveLength(1);
    expect(options[0].providerId).toBe('fast');
  }, 1000);
});
