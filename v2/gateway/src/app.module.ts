import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReservationsService } from './services/reservations/reservations.service';
import { LoyaltyService } from './services/loyalty/loyalty.service';
import { PaymentService } from './services/payment/payment.service';
import { BullModule } from '@nestjs/bull';
import { MessageConsumer } from './services/order/order.consumer';

@Module({
  imports: [HttpModule, 
    BullModule.forRoot({
    }),
    BullModule.registerQueue({
      name:'queue1',
    })
  ],
  controllers: [AppController],
  providers: [AppService, ReservationsService, LoyaltyService, PaymentService, MessageConsumer],
  exports: [BullModule]
})
export class AppModule { }
