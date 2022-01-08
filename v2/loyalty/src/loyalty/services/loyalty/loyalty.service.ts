import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Client } from 'pg';
import { Loyalty } from 'src/models/loyalty';
import { PgService } from 'src/postgres/pg.service';

const LOYALTY_TABLE: string = 'loyalty';

@Injectable()
export class LoyaltyService {
    constructor() {
        var types = require('pg').types
        types.setTypeParser(1700, 'text', parseFloat);
        types.setTypeParser(20, Number);
        this.pg = new PgService().client;
    }

    private pg: Client;


    async getLoyaltyByUser(username: string): Promise<Loyalty> {
        Logger.log(username)
        const query = `
        SELECT * FROM ${LOYALTY_TABLE}
        WHERE username='${username}'
        LIMIT 1;
      `;

        const res = await this.pg.query(query);
        if (res.rows.length === 0)
            throw new NotFoundException("Not Found!");
        else
            return res.rows[0];
    }

    private getStatus(count: number) {
        if (count > 20) {
            return 'GOLD';
        } else if (count > 10) {
            return 'SILVER';
        } else {
            return 'BRONZE';
        }
    }

    async updateLoyaltyCounter(username: string, type: 'inc' | 'dec') {
        const loyalty = await this.getLoyaltyByUser(username);
        Logger.log(loyalty.reservation_count)
        const count = type === 'inc' ? loyalty.reservation_count + 1 : loyalty.reservation_count - 1;
        Logger.log(count)
        const status = this.getStatus(count);

        const query = `
            UPDATE ${LOYALTY_TABLE}
            SET reservation_count=${count}, status='${status}' 
            WHERE username='${username}';
        `;

        try {
            await this.pg.query(query);
            return this.getLoyaltyByUser(username);
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException("Failed to update loyalty!");
        }
    }

    public async createLoyalty(username: string) {
        const query = `
        INSERT INTO ${LOYALTY_TABLE} (username, reservation_count, status, discount)
        VALUES ('${username}', 0, 'BRONZE', 0);
      `;
      try {
          await this.pg.query(query);
          return this.getLoyaltyByUser(username)
      } catch (error) {
          console.log(error);
          throw new InternalServerErrorException("Failed to insert payment to table!");
      }
    }
}


