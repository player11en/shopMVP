import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY!,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
              // Enable automatic payment methods including Klarna
              automaticPaymentMethods: true,
            },
          },
          {
            resolve: "./src/providers/bank-transfer",
            id: "bank_transfer",
            options: {
              bankName: process.env.BANK_NAME || "Your Bank Name",
              accountNumber: process.env.BANK_ACCOUNT_NUMBER || "",
              routingNumber: process.env.BANK_ROUTING_NUMBER || "",
              iban: process.env.BANK_IBAN || "",
              swift: process.env.BANK_SWIFT || "",
              instructions: process.env.BANK_TRANSFER_INSTRUCTIONS || 
                "Please transfer the amount to our bank account. Order will be confirmed once payment is received.",
            },
          },
          {
            resolve: "./src/providers/paypal",
            id: "paypal",
            options: {
              clientId: process.env.PAYPAL_CLIENT_ID,
              clientSecret: process.env.PAYPAL_CLIENT_SECRET,
              environment: (process.env.PAYPAL_ENVIRONMENT as 'sandbox' | 'live') || 'sandbox',
            },
          },
        ],
      },
    },
  ],
})
