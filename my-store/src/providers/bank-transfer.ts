import { 
  AbstractPaymentProvider, 
  PaymentSessionStatus,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  ModuleProvider,
  Modules,
} from "@medusajs/framework/utils"

interface BankTransferOptions {
  bankName?: string
  accountNumber?: string
  routingNumber?: string
  iban?: string
  swift?: string
  instructions?: string
}

class BankTransferProvider extends AbstractPaymentProvider<BankTransferOptions> {
  static identifier = "bank_transfer"

  static validateOptions(options: BankTransferOptions): void {
    // Bank transfer doesn't require API keys, but you can validate custom options here
  }

  async getPaymentStatus(paymentSessionData: Record<string, unknown>): Promise<PaymentSessionStatus> {
    // Bank transfers are always pending until manually confirmed
    return PaymentSessionStatus.PENDING
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const { amount, currency_code } = input

    // For bank transfer, we just create a pending payment session
    // The actual payment will be confirmed manually by the admin
    return {
      data: {
        status: "pending",
        amount,
        currency_code,
        payment_method: "bank_transfer",
        instructions: this.options.instructions || "Please transfer the amount to our bank account. Order will be confirmed once payment is received.",
        bankName: this.options.bankName,
        accountNumber: this.options.accountNumber,
        routingNumber: this.options.routingNumber,
        iban: this.options.iban,
        swift: this.options.swift,
      },
    }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    // Bank transfers are authorized manually by admin
    // This just marks it as pending
    return { data: input.data, status: PaymentSessionStatus.PENDING }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    // Can cancel pending bank transfer
    return { data: input.data }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    // Bank transfers are captured manually by admin after confirming receipt
    return { data: input.data }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    // Can delete pending bank transfer
    return { data: input.data }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    // Bank transfer refunds are handled manually
    return { data: input.data }
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    return { data: input.data }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return this.initiatePayment(input)
  }
}

// Export as a module provider for Medusa v2
export default ModuleProvider(Modules.PAYMENT, {
  services: [BankTransferProvider],
})

