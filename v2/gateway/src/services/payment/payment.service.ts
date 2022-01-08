import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Payment } from 'src/models/payment';
import { catchError, map, of } from 'rxjs';
const path = require('path');

@Injectable()
export class PaymentService {
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

    private path = process.env.PAYMENT_URL;

    public getPayment(username:string, paymentId: string) {
        const url = this.path + `/payment/${paymentId}`;

        return this.http.get<Payment>(url, {headers: {
            'X-User-Name': username,
        }}).pipe(
            map(res => res.data),
            catchError(e => of(null))
        );
    }

    public createPayment(username:string, payment: Payment) {
        const url = this.path + `/payment`;


        return this.http.post<Payment>(url, payment, {headers: {
            'X-User-Name': username,
        }}).pipe(
            map(res => res.data),
            catchError(e => of(null))
        );
    }

    public changePaymentState(username, uid, status) {
        const url = this.path + `/payment/${uid}`;

        return this.http.patch<Payment>(url,{status}, {headers: {
            'X-User-Name': username,
        }}).pipe(
            map(res => res.data),
            catchError(e => of(null))
        );
    }
}
