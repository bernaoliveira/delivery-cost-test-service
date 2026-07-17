import { Module } from '@nestjs/common';
import { DeliveryModule } from './modules/delivery/delivery.module.js';

@Module({
  imports: [DeliveryModule],
})
export class AppModule {}
