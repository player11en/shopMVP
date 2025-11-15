import { 
  AbstractPaymentProvider, 
  PaymentSessionStatus,
  PaymentActions,
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

  async getPaymentStatus(input: any): Promise<any> {
    // Bank transfers are always pending until manually confirmed
    return { status: PaymentSessionStatus.PENDING }
  }

  async getWebhookActionAndData(data: any): Promise<any> {
    // Bank transfers don't use webhooks
    return { action: PaymentActions.NOT_SUPPORTED, data: { session_id: "", amount: 0 } }
  }

  async initiatePayment(input: any): Promise<any> {
    const { amount, currency_code } = input
    const options = (this as any).options_ || {}

    // For bank transfer, we just create a pending payment session
    // The actual payment will be confirmed manually by the admin
    return {
      id: `bank_transfer_${Date.now()}`,
      data: {
        status: "pending",
        amount,
        currency_code,
        payment_method: "bank_transfer",
        instructions: options.instructions || "Please transfer the amount to our bank account. Order will be confirmed once payment is received.",
        bankName: options.bankName,
        accountNumber: options.accountNumber,
        routingNumber: options.routingNumber,
        iban: options.iban,
        swift: options.swift,
      },
    }
  }

  async authorizePayment(input: any): Promise<any> {
    // Bank transfers are authorized manually by admin
    // This just marks it as pending
    return { data: input.data, status: PaymentSessionStatus.PENDING }
  }

  async cancelPayment(input: any): Promise<any> {
    // Can cancel pending bank transfer
    return { data: input.data }
  }

  async capturePayment(input: any): Promise<any> {
    // Bank transfers are captured manually by admin after confirming receipt
    return { data: input.data }
  }

  async deletePayment(input: any): Promise<any> {
    // Can delete pending bank transfer
    return { data: input.data }
  }

  async refundPayment(input: any): Promise<any> {
    // Bank transfer refunds are handled manually
    return { data: input.data }
  }

  async retrievePayment(input: any): Promise<any> {
    return { data: input.data }
  }

  async updatePayment(input: any): Promise<any> {
    return this.initiatePayment(input)
  }
}

// Export as a module provider for Medusa v2
export default ModuleProvider(Modules.PAYMENT, {
  services: [BankTransferProvider as any],
})
