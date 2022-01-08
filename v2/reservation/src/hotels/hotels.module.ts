import { Module } from '@nestjs/common';
import { HotelsController } from './controllers/hotels/hotels.controller';
import { HotelsService } from './services/hotels/hotels.service';

@Module({
  controllers: [HotelsController],
  providers: [HotelsService],
  exports: [HotelsService]
})
export class HotelsModule {}
