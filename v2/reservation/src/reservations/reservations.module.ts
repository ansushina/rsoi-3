import { Module } from '@nestjs/common';
import { HotelsModule } from 'src/hotels/hotels.module';
import { ReservationsController } from './controllers/reservations/reservations.controller';
import { ReservationsService } from './services/reservations/reservations.service';

@Module({
  imports:[HotelsModule],
  controllers: [ReservationsController],
  providers: [ReservationsService]
})
export class ReservationsModule {}
