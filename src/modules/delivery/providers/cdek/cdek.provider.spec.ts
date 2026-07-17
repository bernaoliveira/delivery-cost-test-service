import { MockCdekProvider } from './cdek.provider';
import { CalculateDeliveryDto } from '../../dto/calculate-delivery.dto';

describe('MockCdekProvider', () => {
  const provider = new MockCdekProvider();

  const makeRequest = (weight: number): CalculateDeliveryDto => ({
    basket: {
      weight,
      dimensions: { length: 30, width: 20, height: 15 },
      total: 1000,
    },
    address: {
      addressLine1: 'ул. Ленина, 1',
      city: 'Москва',
      zipCode: '101000',
    },
  });

  it('should have correct id and name', () => {
    expect(provider.id).toBe('cdek');
    expect(provider.name).toBe('СДЭК');
  });

  it('should calculate price based on weight (100 RUB/kg)', async () => {
    const options = await provider.calculate(makeRequest(2.5));

    expect(options).toHaveLength(1);
    expect(options[0].price).toBe(250);
  });

  it('should return 100 RUB for 1 kg', async () => {
    const options = await provider.calculate(makeRequest(1));
    expect(options[0].price).toBe(100);
  });

  it('should round price to integer', async () => {
    const options = await provider.calculate(makeRequest(1.555));
    expect(options[0].price).toBe(156);
  });

  it('should return correct delivery option format', async () => {
    const options = await provider.calculate(makeRequest(1));

    expect(options[0]).toEqual({
      providerId: 'cdek',
      providerName: 'СДЭК',
      price: 100,
      currency: 'RUB',
      estimatedDays: { min: 2, max: 4 },
    });
  });
});
