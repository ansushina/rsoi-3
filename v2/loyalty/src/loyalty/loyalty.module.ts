import { Module } from '@nestjs/common';
import { LoyaltyController } from './controllers/loyalty/loyalty.controller';
import { LoyaltyService } from './services/loyalty/loyalty.service';

@Module({
  controllers: [LoyaltyController],
  providers: [LoyaltyService]
})
export class LoyaltyModule {}
