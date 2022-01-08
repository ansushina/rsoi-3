import { BadRequestException, Body, Controller, Get, Patch, Post, Req } from '@nestjs/common';
import { LoyaltyService } from 'src/loyalty/services/loyalty/loyalty.service';
import { Request } from 'express';
import { Loyalty } from 'src/models/loyalty';

@Controller('loyalty')
export class LoyaltyController {
    constructor(
        private readonly loyalty: LoyaltyService,
    ) { }

    public loyaltyToDTO(l : Loyalty) {
        return {
            ...l,
            reservationCount: l.reservation_count,
            id: undefined, 
            reservation_count: undefined,
        }
    }

    @Get('/')
    async getUserLoyalty(
        @Req() request: Request
    ) {
        
        const username: string = request.headers['x-user-name']?.toString();
        if (!username) throw new  BadRequestException('username must be provided');
        const l = await this.loyalty.getLoyaltyByUser(username);
        return this.loyaltyToDTO(l);
    }

    @Post('/')
    async createUserLoyalty(
        @Req() request: Request
    ) {
        const username: string = request.headers['x-user-name']?.toString();
        if (!username) throw new  BadRequestException('username must be provided'); 
        const l = await this.loyalty.createLoyalty(username);
        return this.loyaltyToDTO(l);
    }

    @Patch('/')
    async updateUserLoyalty(
        @Body('type') type: 'inc' | 'dec',
        @Req() request: Request
    ) {

        const username: string = request.headers['x-user-name']?.toString();
        if (!username) throw new  BadRequestException('username must be provided');
        const l = await this.loyalty.updateLoyaltyCounter(username, type);
        return this.loyaltyToDTO(l);
    }
}
