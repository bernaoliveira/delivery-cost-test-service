import { Module } from '@nestjs/common';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { DELIVERY_PROVIDERS_INJECT_KEY } from './providers/constants';
import { MockCdekProvider } from './providers/cdek/cdek.provider';
import { MockBoxberryProvider } from './providers/boxberry/boxberry.provider';

@Module({
  controllers: [DeliveryController],
  providers: [
    DeliveryService,
    {
      provide: DELIVERY_PROVIDERS_INJECT_KEY,
      useFactory: () => [new MockCdekProvider(), new MockBoxberryProvider()],
    },
  ],
})
export class DeliveryModule {
}
