
export class Payment {
    id: number;
    payment_uid: string;
    status: 'PAID' | 'CANCELED';
    price: number;
}


// CREATE TABLE payment
// (
//     id          SERIAL PRIMARY KEY,
//     payment_uid uuid        NOT NULL,
//     status      VARCHAR(20) NOT NULL
//         CHECK (status IN ('PAID', 'CANCELED')),
//     price       INT         NOT NULL
// );