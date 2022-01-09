import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpException, Logger, Param, Post, Query, Req, ServiceUnavailableException } from '@nestjs/common';
import { get } from 'http';
import { AppService } from './app.service';
import { LoyaltyService } from './services/loyalty/loyalty.service';
import { ReservationsService } from './services/reservations/reservations.service';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Hotel } from './models/hotel';
import * as moment from 'moment';
import { PaymentService } from './services/payment/payment.service';
import { Payment } from './models/payment';
import { Loyalty } from './models/loyalty';
import { Reservation } from './models/reservation';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { defaultThrottleConfig } from 'rxjs/internal/operators/throttle';

@Controller('api/v1')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly reservation: ReservationsService,
    private readonly loyalty: LoyaltyService,
    private readonly payment: PaymentService,
    @InjectQueue('queue1') private queue: Queue
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/hotels')
  async getHotels(
    @Query('page') page: number,
    @Query('size') size: number
  ) {
    return this.reservation.getHotels(page, size).toPromise();
  }

  @Get('/me')
  async getMe(
    @Req() request: Request
  ) {
    const username: string = request.headers['x-user-name']?.toString();
    if (!username) throw new  BadRequestException('username must be provided'); 

    const reservations = await this.getAllReservations(username);
    let loyality = await this.loyalty.getLoyalty(username).toPromise();
    if (!loyality)  {
      loyality = await this.loyalty.createLoyalty(username).toPromise();
    }

    if (!loyality) {
      return {
        reservations,
        loyalty: {}
      }
    }

    return {
      reservations,
      loyalty: {
        status: loyality.status,
        discount: loyality.discount,
      }
    }
  }


  private async getAllReservations(username) {
    const reservations = await this.reservation.getUserReservations(username).toPromise();
    
    const items = [];
    for (const r of reservations) {
      const p = await this.payment.getPayment(username, r.paymentUid).toPromise(); 
      items.push({
        ...r,
        startDate: moment(new Date(r.startDate)).format('YYYY-MM-DD'),
        endDate: moment(new Date(r.endDate)).format('YYYY-MM-DD'),
        paymentUid: undefined, 
        payment: p ? {
          status: p.status,
          price: p.price,
        } : {}
      })
    }
    return items;
  }

  @Get('/reservations')
  async getReservations(
    @Req() request: Request
  ) { 
    const username: string = request.headers['x-user-name']?.toString();
    if (!username) throw new  BadRequestException('username must be provided'); 
    return this.getAllReservations(username);
  }

  @Post('/reservations/')
  @HttpCode(200)
  async createReservation(
    @Req() request: Request,
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
    @Body('hotelUid') hotelUid: string,
  ) { 
    const username: string = request.headers['x-user-name']?.toString();
    if (!username) throw new  BadRequestException('username must be provided'); 
    // get hotel 

    const hotel = await  this.reservation.getHotel(hotelUid).toPromise();
    if (!hotel) {
      throw new ServiceUnavailableException('Reservation Service unavailable')
    }

    Logger.log(JSON.stringify(hotel))

    // count nigths

    const date1 = moment(startDate,"YYYY-MM-DD");
    const date2 = moment(endDate, "YYYY-MM-DD");

    const days = date2.diff(date1, 'days');

    
    // Logger.log(JSON.stringify(days))
    // count pay

    const pay = hotel.price * days;

    // get loyalty

    let loyalty = await this.loyalty.getLoyalty(username).toPromise();

    if (!loyalty) {
      loyalty = await this.loyalty.createLoyalty(username).toPromise();
    }

    if (!loyalty) {
      throw new ServiceUnavailableException('Loyalty Service unavailable');
    }

    
    // Logger.log(JSON.stringify(loyalty))

    //count sale

    let sale = 0;
    if (loyalty.status === 'BRONZE') {
      sale = 5;
    } else if (loyalty.status === 'SILVER') {
      sale = 7;
    } else if (loyalty.status === 'GOLD') {
      sale = 10;
    }

    const resultPay = pay * (100 - sale) / 100;

    // payment 

    const payment = {
      payment_uid: uuidv4(),
      status: 'PAID',
      price: resultPay,
    } as Payment;

    const p = await this.payment.createPayment(username, payment).toPromise();
    if (!p) {
      throw new ServiceUnavailableException('Payment Service unavailable');
    }
    
    // Logger.log(JSON.stringify(p))

    // loylty 

    const l2 = await this.loyalty.updateLoyaltyCount(username, 'inc').toPromise();

    // Logger.log(JSON.stringify(l2))

    // reservation

    const reservation = {
      reservation_uid: uuidv4(),
      hotel_id: hotelUid,
      payment_uid: payment.payment_uid,
      status: 'PAID',
      start_date: startDate,
      end_data: endDate,
      username,
    } as Reservation;

    // Logger.log(JSON.stringify(reservation))

    const r = await this.reservation.createReservation(username, reservation).toPromise();

    // Logger.log(JSON.stringify(r))
    return {
      ...r, 
      startDate: moment(new Date(r.startDate)).format('YYYY-MM-DD'),
      endDate: moment(new Date(r.endDate)).format('YYYY-MM-DD'),
      discount: loyalty.discount,
      payment: {
        status: payment.status,
        price: payment.price,
      }
    }
  }

  @Get('/reservations/:reservationId')
  async getReservationById(
    @Param('reservationId') uid: string,
    @Req() request: Request
  ) {
    const username: string = request.headers['x-user-name']?.toString();
    if (!username) throw new  BadRequestException('username must be provided'); 

    const r = await this.reservation.getReservation(username, uid).toPromise(); 
    const p = await this.payment.getPayment(username, r.paymentUid).toPromise(); 

    return {
      ...r,
      startDate: moment(new Date(r.startDate)).format('YYYY-MM-DD'),
      endDate: moment(new Date(r.endDate)).format('YYYY-MM-DD'),
      paymentUid: undefined, 
      payment: p ? {
        status: p.status,
        price: p.price,
      } : {}
    }
   }

  @Delete('/reservations/:reservationId')
  @HttpCode(204)
  async deleteReservation(
    @Param('reservationId') uid: string,
    @Req() request: Request
  ) { 
    const username: string = request.headers['x-user-name']?.toString();
    if (!username) throw new  BadRequestException('username must be provided'); 

    // status reservation canceled

    const r = await this.reservation.setReservationStatus(username, uid, 'CANCELED').toPromise();

    if (!r) {
      throw new ServiceUnavailableException('Reservation Service unavailable')
    }

    // payment cancelled

    const p = await this.payment.changePaymentState(username, r.paymentUid, 'CANCELED').toPromise();

    if (!p) {
      throw new ServiceUnavailableException('Reservation Service unavailable')
    }

    //loylty - 1 

    Logger.log('try to add job')
    const job = await this.queue.add('job1',
    {
      try: 1, 
      creationTime: Date.now(),
      request: 'updateLoyalty', 
      requestData: {
        username, 
        type: 'dec',
      }
    });
    // const l = await this.loyalty.updateLoyaltyCount(username, 'dec').toPromise();
    // Logger.log(JSON.stringify(l))
  }

  @Get('loyalty')
  async getLoyalty(
    @Req() request: Request
  ) {
    const username: string = request.headers['x-user-name']?.toString();
    if (!username) throw new  BadRequestException('username must be provided'); 

    const l = await this.loyalty.getLoyalty(username).toPromise();
    if (l === null) {
      throw new ServiceUnavailableException('Loyalty Service unavailable');
    }
    Logger.log(l)
    return {
      ...l,
      username: undefined,
    }
  }
}
