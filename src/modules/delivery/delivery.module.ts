import { Module } from '@nestjs/common';
import { DeliveryController } from './delivery.controller.js';
import { DeliveryService } from './delivery.service.js';
import { DELIVERY_PROVIDERS_INJECT_KEY } from './providers/constants.js';
import { MockCdekProvider } from './providers/cdek.provider.js';
import { MockBoxberryProvider } from './providers/boxberry.provider.js';

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
export class DeliveryModule {}
