import { Body, Controller, Delete,  BadRequestException, Get, HttpException, Logger, Param, Post, Req, Patch } from '@nestjs/common';
import { Reservation } from 'src/models/reservation';
import { ReservationsService } from 'src/reservations/services/reservations/reservations.service';
import { Request } from 'express';
import { Hotel } from 'src/models/hotel';
import { HotelsService } from 'src/hotels/services/hotels/hotels.service';

@Controller('reservations')
export class ReservationsController {
    constructor(
        private readonly reservations: ReservationsService,
        private readonly hotel: HotelsService,
    ) { }


    public reservationToDTO(r: Reservation, h: Hotel) {
        return {
            status: r.status,
            hotel: {
                hotelUid: h.hotel_uid,
                name: h.name,
                fullAddress: h.country + ', ' + h.city + ', '+h.address,
                stars: h.stars
            },
            reservationUid: r.reservation_uid,
            startDate: r.start_date,
            endDate: r.end_data,
            paymentUid: r.payment_uid,
        }
    }

    @Get('/')
    async getAllUsersReservations(
        @Req() request: Request
    ) {
        Logger.log(JSON.stringify(request.headers))
        const username: string = request.headers['x-user-name']?.toString();
        if (!username) throw new  BadRequestException('username must be provided');
        const reservations =  await this.reservations.getUserReservations(username);
        const items = [];
        for (const r of reservations) {
            const h = await this.hotel.getHotelById(r.hotel_id);
            items.push(this.reservationToDTO(r, h));
        }
        return items;
    }

    @Get('/:reservationUid') 
    async getOneReservation(
        @Param('reservationUid') uid: string,  
        @Req() request: Request
    ) {
        const username: string = request.headers['x-user-name']?.toString();
        if (!username) throw new  BadRequestException('username must be provided');
        const r = await this.reservations.getReservationById(uid);
        const h = await this.hotel.getHotelById(r.hotel_id);
        if (r.username === username) {
            return this.reservationToDTO(r, h);
        } else {
            throw new HttpException('Username not equal', 403);
        }
    }

    @Post('/')
    async createReservation(
        @Body() body: Reservation,
        @Req() request: Request
    ) {
        const username: string = request.headers['x-user-name']?.toString();
        if (!username) throw new  BadRequestException('username must be provided');
        if (body.username != username) throw new HttpException('cant create reservation for another user', 403); 
        const h = await this.hotel.getHotelByUid(body.hotel_id.toString());
        if (!h) throw new BadRequestException('no hotel with this id')
        const r = await this.reservations.createReservation({
            ...body,
            hotel_id: h.id,
        });
        const dto = this.reservationToDTO(r, h);
        return {
            ...dto, 
            hotel: undefined, 
            hotelUid: body.hotel_id,
        }
    }

    @Patch('/:reservationUid') 
    async updateReservation(
        @Param('reservationUid') uid: string,  
        @Req() request: Request,
        @Body('status') status: string, 
    ) {
        const username: string = request.headers['x-user-name']?.toString();
        if (!username) throw new  BadRequestException('username must be provided');
        const r = await this.reservations.getReservationById(uid);
        if (r.username === username) {
            const result = await this.reservations.updateReservationStatus(uid, status);
            const h = await this.hotel.getHotelById(r.hotel_id);
            return this.reservationToDTO(result, h);
        } else {
            throw new HttpException('Username not equal', 403);
        }
    }

    @Delete('/:reservationUid') 
    async deleteReservation(
        @Param('reservationUid') uid: string,  
        @Req() request: Request
    ) {
        const username =  request.headers['X-User-Name'].toString();
        const r = await this.reservations.getReservationById(uid);
        if (r.username === username) {
            await this.reservations.deleteReservation(uid)
        } else {
            throw new HttpException('Username not equal', 403);
        }
    }
}
