import { Inject, Injectable, Logger } from '@nestjs/common';
import { DeliveryProvider } from './interfaces/delivery-provider.interface';
import { DeliveryOption } from './interfaces/delivery-option.interface';
import { DELIVERY_PROVIDERS_INJECT_KEY } from './providers/constants';
import { CalculateDeliveryDto } from './dto/calculate-delivery.dto';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(
    @Inject(DELIVERY_PROVIDERS_INJECT_KEY)
    private readonly providers: DeliveryProvider[],
  ) {}

  async calculateForAllProviders(calculateDeliveryDto: CalculateDeliveryDto): Promise<DeliveryOption[]> {
    const results = await Promise.allSettled(
      this.providers.map((provider) => this.callWithTimeout(provider, calculateDeliveryDto)),
    );

    const options: DeliveryOption[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'fulfilled') {
        options.push(...result.value);
      } else {
        this.logger.error(
          `Provider "${this.providers[i].id}" failed: ${result.reason}`,
        );
      }
    }

    return options;
  }

  private callWithTimeout(provider: DeliveryProvider, dto: CalculateDeliveryDto): Promise<DeliveryOption[]> {
    let timerId: ReturnType<typeof setTimeout>;

    const timeout = new Promise<never>((_, reject) => {
      timerId = setTimeout(
        () => reject(new Error(`Provider "${provider.id}" did not respond within ${provider.timeoutMs} ms`)),
        provider.timeoutMs,
      );
    });

    return Promise.race([provider.calculate(dto), timeout]).finally(() => clearTimeout(timerId));
  }
}
