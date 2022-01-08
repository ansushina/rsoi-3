export class Loyalty {
    username: string;
    reservation_count: number; 
    status: 'BRONZE' | 'SILVER' | 'GOLD'; 
    discount: number;
}

// CREATE TABLE loyalty
// (
//     id                SERIAL PRIMARY KEY,
//     username          VARCHAR(80) NOT NULL UNIQUE,
//     reservation_count INT         NOT NULL DEFAULT 0,
//     status            VARCHAR(80) NOT NULL DEFAULT 'BRONZE'
//         CHECK (status IN ('BRONZE', 'SILVER', 'GOLD')),
//     discount          INT         NOT NULL
// );