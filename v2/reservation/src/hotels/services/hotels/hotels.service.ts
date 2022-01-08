import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'pg';
import { Hotel } from 'src/models/hotel';
import { PgService } from 'src/postgres/pg.service';

const HOTELS_TABLE: string = 'hotels';

@Injectable()
export class HotelsService {
    constructor() {
        var types = require('pg').types
        types.setTypeParser(1700, 'text', parseFloat);
        types.setTypeParser(20, Number);
        this.pg = new PgService().client;
    }

    private pg: Client;

    public hotelToHotelDTO(h: Hotel) {
        return {
            ...h,
            hotelUid: h.hotel_uid,
            hotel_uid: undefined,
        }
    }

    async getHotelsCount() {
        const query = `SELECT COUNT(*) FROM ${HOTELS_TABLE};`
        const res = await this.pg.query(query);
        return res.rows[0].count;
    }

    async getAllHotels(page: number = 1, size: number | 'all' = 'all'): Promise<Hotel[]> {

        // Logger.log(JSON.stringify(await this.pg.query(`INSERT INTO hotels (hotel_uid, name, country, city, address, stars, price) VALUES ('049161bb-badd-4fa8-9d90-87c9a82b0668', 'Ararat Park Hyatt Moscow', 'Россия', 'Москва', 'Неглинная ул., 4', 5, 10000);`)));
        const query = `
        SELECT * FROM ${HOTELS_TABLE}
        LIMIT ${size} OFFSET ${size == 'all' ? 0 : size * (page-1)};
      `;

        const res = await this.pg.query(query);
        return res.rows;
        
    }

    async getHotelByUid(uid: string): Promise<Hotel> {
        const query = `
        SELECT * FROM ${HOTELS_TABLE}
        WHERE hotel_uid='${uid}'
        LIMIT 1;
      `;

        const res = await this.pg.query(query);
        if (res.rows.length === 0)
            throw new Error("Not Found!");
        else
            return res.rows[0];
    }

    async getHotelById(id: number) {
        const query = `
        SELECT * FROM ${HOTELS_TABLE}
        WHERE id=${id}
        LIMIT 1;
      `;

        const res = await this.pg.query(query);
        if (res.rows.length === 0)
            throw new Error("Not Found!");
        else
            return res.rows[0];
    }
}


