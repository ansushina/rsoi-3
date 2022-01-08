import { Injectable, Logger } from '@nestjs/common';
import { Observable, map, catchError, of } from 'rxjs';
import { Hotel } from 'src/models/hotel';
import { HttpService } from '@nestjs/axios';
import { Loyalty } from 'src/models/loyalty';
const path = require('path');

@Injectable()
export class LoyaltyService {
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

    private path = process.env.LOYALTY_URL;

    public getLoyalty(username): Observable<Loyalty> {
        // Logger.log(this.path)
        const url = this.path + '/loyalty';

        return this.http.get<Loyalty>(url, {headers: {
            'X-User-Name': username,
        }}).pipe(
            map(res => res.data),
            catchError(e => of(null))
        );
    } 

    public createLoyalty(username) {
        const url = this.path + '/loyalty';

        return this.http.post<Loyalty>(url, {}, {headers: {
            'X-User-Name': username,
        }}).pipe(
            map(res => res.data),
            catchError(e => of(null))
        );
    }

    public updateLoyaltyCount(username: string, type: 'inc' | 'dec') {
        const url = this.path + '/loyalty';

        return this.http.patch<Loyalty>(url, {
            type
        }, {headers: {
            'X-User-Name': username,
        }}).pipe(
            map(res => res.data),
            catchError(e => of(null))
        );
    }
}
