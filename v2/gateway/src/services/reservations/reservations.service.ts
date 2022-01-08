import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { URLSearchParams } from 'url';
import { catchError, map, Observable, of } from 'rxjs';
import { Hotel } from 'src/models/hotel';
import { Reservation } from 'src/models/reservation';
const path = require('path');

@Injectable()
export class ReservationsService {
    constructor(
        private readonly http: HttpService,
    ) {
        require('dotenv').config({
            path: path.resolve(
                process.cwd(),
                '.env',
            ),
        });
    }

    private path = 'http://localhost:3000'//process.env.RESERVATION_URL;

    public getHotels(page, pageSize): Observable<Hotel[]> {
        const url = this.path + '/hotels';

        const params = new URLSearchParams()
        params.set('page', page);
        params.set('size', pageSize);

        return this.http.get(url, {params}).pipe(
            map(res => res.data),
            catchError(e => of(null))
        );
    } 

    public getHotel(uid: string) {
        const url = this.path + `/hotels/${uid}`;

        return this.http.get<Hotel>(url).pipe(
            map(res => res.data),
            catchError(e => of(null))
        );
    }

    public createReservation(username, r: Reservation) {
        const url = this.path + `/reservations`;

        return this.http.post<Reservation>(url, r, {headers: {
            'X-User-Name': username,
        }}).pipe(
            map(res => res.data),
            catchError(e => of(null))
        );
    }


    public getReservation(username, uid) {
        const url = this.path + `/reservations/${uid}`;

        return this.http.get<Reservation>(url,  {headers: {
            'X-User-Name': username,
        }}).pipe(
            map(res => res.data),
            catchError(e => of(null))
        );
    }

    public getUserReservations(username) {
        const url = this.path + `/reservations`;

        return this.http.get<Reservation[]>(url,  {headers: {
            'X-User-Name': username,
        }}).pipe(
            map(res => res.data),
            catchError(e => of(null))
        );
    }

    public setReservationStatus(username, uid,  status) {
        const url = this.path + `/reservations/${uid}`;

        return this.http.patch<Reservation>(url, {status} ,  {headers: {
            'X-User-Name': username,
        }}).pipe(
            map(res => res.data),
            catchError(e => of(null))
        );
    }
}
