import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Payment } from 'src/models/payment';
import { PaymentService } from 'src/payment/services/payment/payment.service';

@Controller('payment')
export class PaymentController {
    constructor(
        private readonly payment: PaymentService,
    ) {}

    @Post('/')
    async createPayment(
        @Body() body: Payment,
    )  {
        return await this.payment.createPayment(body); 
    }

    @Patch('/:paymentId') 
    async updatePayment(
        @Body() body: Payment, 
        @Param('paymentId') uid: string,
    ) {
        return await this.payment.updatePaymentStatus(uid, body.status);
    }

    @Get('/:paymentId')
    async getPayment(
        @Param('paymentId') uid: string,
    ) {
        return await this.payment.getPaymentByUid(uid);
    }
}
