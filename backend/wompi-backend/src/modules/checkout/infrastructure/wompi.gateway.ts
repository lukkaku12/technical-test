import { Injectable } from '@nestjs/common';

import type {
  PaymentGatewayPort,
  PaymentRequest,
  PaymentResult,
} from '../application/ports/payment-gateway.port';

type WompiPaymentSourceResponse = {
  data?: {
    id?: string;
  };
  error?: {
    message?: string;
  };
};

type WompiTransactionResponse = {
  data?: {
    id?: string;
    status?: string;
  };
  error?: {
    message?: string;
  };
};

@Injectable()
export class WompiGateway implements PaymentGatewayPort {
  async charge(input: PaymentRequest): Promise<PaymentResult> {
    const baseUrl = process.env.WOMPI_BASE_URL;
    const privateKey = process.env.WOMPI_PRIVATE_KEY;
    const currency = process.env.WOMPI_CURRENCY;

    if (!baseUrl || !privateKey || !currency) {
      return {
        success: false,
        errorMessage: 'Wompi configuration is missing',
      };
    }

    const paymentSource = await this.createPaymentSource(
      baseUrl,
      privateKey,
      input,
    );

    if (!paymentSource.success || !paymentSource.paymentSourceId) {
      return {
        success: false,
        errorMessage: paymentSource.errorMessage ?? 'Payment source failed',
      };
    }

    const transaction = await this.createTransaction(
      baseUrl,
      privateKey,
      currency,
      input,
      paymentSource.paymentSourceId,
    );

    if (!transaction.success) {
      return {
        success: false,
        errorMessage: transaction.errorMessage ?? 'Transaction failed',
      };
    }

    return {
      success: true,
      wompiReference: transaction.wompiReference,
    };
  }

  private async createPaymentSource(
    baseUrl: string,
    privateKey: string,
    input: PaymentRequest,
  ): Promise<{
    success: boolean;
    paymentSourceId?: string;
    errorMessage?: string;
  }> {
    const response = await fetch(`${baseUrl}/payment_sources`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${privateKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'CARD',
        token: input.cardToken,
        customer_email: input.customerEmail,
        acceptance_token: input.acceptanceToken,
        accept_personal_auth: input.acceptPersonalAuth,
      }),
    });

    const payload = (await response.json()) as WompiPaymentSourceResponse;

    if (!response.ok || !payload?.data?.id) {
      return {
        success: false,
        errorMessage:
          payload?.error?.message ?? 'Unable to create payment source',
      };
    }

    return {
      success: true,
      paymentSourceId: payload.data.id,
    };
  }

  private async createTransaction(
    baseUrl: string,
    privateKey: string,
    currency: string,
    input: PaymentRequest,
    paymentSourceId: string,
  ): Promise<{
    success: boolean;
    wompiReference?: string;
    errorMessage?: string;
  }> {
    const response = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${privateKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount_in_cents: input.amount,
        currency,
        customer_email: input.customerEmail,
        payment_source_id: paymentSourceId,
        reference: input.reference,
        payment_method: {
          installments: 1,
        },
      }),
    });

    const payload = (await response.json()) as WompiTransactionResponse;

    if (!response.ok || !payload?.data?.id) {
      return {
        success: false,
        errorMessage:
          payload?.error?.message ?? 'Unable to create transaction',
      };
    }

    const status = payload.data.status;
    if (status === 'APPROVED') {
      return {
        success: true,
        wompiReference: payload.data.id,
      };
    }

    return {
      success: false,
      errorMessage: `Transaction ${status ?? 'failed'}`,
    };
  }
}
