import { CalculateDeliveryDto } from '../dto/calculate-delivery.dto';
import { DeliveryOption } from './delivery-option.interface';

export interface DeliveryProvider {
  readonly id: string;
  readonly name: string;
  readonly timeoutMs: number;

  calculate(calculateDeliveryDto: CalculateDeliveryDto): Promise<DeliveryOption[]>;
}
