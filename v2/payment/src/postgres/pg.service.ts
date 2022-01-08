import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'pg';
const path = require('path');

@Injectable()
export class PgService {
    constructor() {
        this.init();
    }

    public client: Client;

    private logger = new Logger('PostgresService');

    private async init() {
        require('dotenv').config({
            path: path.resolve(
                process.cwd(),
                '.env',
            ),
        });

        const user = process.env.PGUSER;
        const host = process.env.PGHOST;
        const database = process.env.PGDATABASE;
        const password = process.env.PGPASSWORD;
        const port = +process.env.PGPORT;

        this.client = new Client({ user, database, password, host, port, 
            client_encoding: 'WIN1251', ssl:{ rejectUnauthorized: false } });
        this.client.connect((err) => {
            if (err) {
                this.logger.error('Postgres connection error', err.stack);
                throw err;
            } else
                this.logger.log('Connected to PostGis');
        });
    }
}
