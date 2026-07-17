import { MockBoxberryProvider } from './boxberry.provider';
import { CalculateDeliveryDto } from '../../dto/calculate-delivery.dto';

describe('MockBoxberryProvider', () => {
  const provider = new MockBoxberryProvider();

  const makeRequest = (city: string): CalculateDeliveryDto => ({
    basket: {
      weight: 1,
      dimensions: { length: 30, width: 20, height: 15 },
      total: 1000,
    },
    address: {
      addressLine1: 'ул. Ленина, 1',
      city,
      zipCode: '101000',
    },
  });

  it('should have correct id and name', () => {
    expect(provider.id).toBe('boxberry');
    expect(provider.name).toBe('Boxberry');
  });

  it('should return 300 RUB for Москва', async () => {
    const options = await provider.calculate(makeRequest('Москва'));
    expect(options[0].price).toBe(300);
  });

  it('should return 500 RUB for Казань', async () => {
    const options = await provider.calculate(makeRequest('Казань'));
    expect(options[0].price).toBe(500);
  });

  it('should return default 700 RUB for unknown city', async () => {
    const options = await provider.calculate(makeRequest('Владивосток'));
    expect(options[0].price).toBe(700);
  });

  it('should return correct delivery option format', async () => {
    const options = await provider.calculate(makeRequest('Москва'));

    expect(options[0]).toEqual({
      providerId: 'boxberry',
      providerName: 'Boxberry',
      price: 300,
      currency: 'RUB',
      estimatedDays: { min: 3, max: 5 },
    });
  });
});
