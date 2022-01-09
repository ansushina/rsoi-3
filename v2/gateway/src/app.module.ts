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
      redis: {
        host: 'ec2-34-247-243-70.eu-west-1.compute.amazonaws.com',
        port: 13510,
        password: 'pb75d8f8fda76b3cd89e321b57db8dda2bea6ae899d705f5db90e4f728aa4d55e',
        tls: {
          rejectUnauthorized: false
      }
      },
    }),
    BullModule.registerQueue({
      name:'queue1',
      // redis: {
      //   // host: 'ec2-34-247-243-70.eu-west-1.compute.amazonaws.com',
      //   // port: 13510,
      //   // password: 'pb75d8f8fda76b3cd89e321b57db8dda2bea6ae899d705f5db90e4f728aa4d55e',
      //   path: 'redis://:pb75d8f8fda76b3cd89e321b57db8dda2bea6ae899d705f5db90e4f728aa4d55e@ec2-34-247-243-70.eu-west-1.compute.amazonaws.com:13510'
      // }
    })
  ],
  controllers: [AppController],
  providers: [AppService, ReservationsService, LoyaltyService, PaymentService, MessageConsumer],
  exports: [BullModule]
})
export class AppModule { }
