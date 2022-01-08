import { Controller, Get, Param, Query } from '@nestjs/common';
import { HotelsService } from 'src/hotels/services/hotels/hotels.service';
import { Hotel } from 'src/models/hotel';

@Controller('hotels')
export class HotelsController {
    constructor(
        private readonly hotels: HotelsService
    ) {

    }

    @Get('/')
    async getAll(
        @Query('size') pageSize: number,
        @Query('page') page: number
    ) {
        const items =  (await this.hotels.getAllHotels(page, pageSize)).map(h => this.hotels.hotelToHotelDTO(h));
        const count  = await this.hotels.getHotelsCount();
        return {
            page: page? parseInt(page.toString()) : 1,
            pageSize: pageSize ? parseInt(pageSize?.toString()) : count,
            totalElements: count,
            items
        }; 
    }

    @Get('/:hotelUid') 
    async getOneHotel(
        @Param('hotelUid') uid: string,  
    ) {
        return this.hotels.hotelToHotelDTO( await this.hotels.getHotelByUid(uid));
    }
}
