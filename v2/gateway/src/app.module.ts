import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReservationsService } from './services/reservations/reservations.service';
import { LoyaltyService } from './services/loyalty/loyalty.service';
import { PaymentService } from './services/payment/payment.service';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [AppService, ReservationsService, LoyaltyService, PaymentService],
})
export class AppModule { }
