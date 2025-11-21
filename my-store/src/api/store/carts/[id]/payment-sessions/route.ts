import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id: cartId } = req.params

  try {
    // Use query service to get cart and region data
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    
    // Get cart with region and payment providers
    const { data: carts } = await query.graph({
      entity: "cart",
      fields: [
        "id",
        "total",
        "subtotal",
        "currency_code",
        "region_id",
        "region.id",
        "region.payment_providers.id",
        "region.payment_providers.provider_id",
      ],
      filters: {
        id: [cartId],
      },
    })

    if (!carts || carts.length === 0) {
      return res.status(404).json({
        message: `Cart ${cartId} not found`,
      })
    }

    const cart: any = carts[0]
    const region: any = cart.region

    if (!region || !region.payment_providers || region.payment_providers.length === 0) {
      return res.status(400).json({
        message: "No payment providers configured for this cart's region",
      })
    }

    // Get cart total (use total or subtotal)
    const cartTotal = (cart.total ?? cart.subtotal) || 0

    // Resolve payment module service
    let paymentModuleService: any
    try {
      paymentModuleService = req.scope.resolve(Modules.PAYMENT)
    } catch (error) {
      return res.status(500).json({
        message: "Payment module not available",
        error: "Payment service could not be resolved",
      })
    }

    // Create payment collection for the cart
    let paymentCollection: any
    try {
      const collections = await paymentModuleService.createPaymentCollections({
        region_id: cart.region_id,
        currency_code: cart.currency_code,
        amount: cartTotal,
        metadata: {
          cart_id: cartId,
        },
      })
      paymentCollection = Array.isArray(collections) ? collections[0] : collections
    } catch (error: any) {
      console.error("Error creating payment collection:", error)
      return res.status(500).json({
        message: "Error creating payment collection",
        error: error.message,
      })
    }

    // Create payment sessions for each provider
    const paymentSessions: any[] = []
    for (const provider of region.payment_providers) {
      if (!provider) continue
      try {
        const providerId = (provider as any).provider_id || provider.id
        const sessions = await paymentModuleService.createPaymentSessions({
          payment_collection_id: paymentCollection.id,
          provider_id: providerId,
          amount: cartTotal,
          currency_code: cart.currency_code,
        })
        const session = Array.isArray(sessions) ? sessions[0] : sessions
        if (session) {
          paymentSessions.push({
            id: session.id,
            provider_id: providerId,
            amount: cartTotal,
            currency_code: cart.currency_code,
            status: session.status || "pending",
            data: session.data || {},
          })
        }
      } catch (error: any) {
        const providerId = (provider as any).provider_id || provider.id
        console.error(`Failed to create payment session for provider ${providerId}:`, error)
        // Continue with other providers
      }
    }

    if (paymentSessions.length === 0) {
      return res.status(500).json({
        message: "Failed to create any payment sessions",
      })
    }

    res.json({
      payment_sessions: paymentSessions,
    })
  } catch (error: any) {
    console.error("Error creating payment sessions:", error)
    res.status(500).json({
      message: "Error creating payment sessions",
      error: error.message,
    })
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id: cartId } = req.params

  try {
    // Use query service to get cart with payment collection
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    
    const { data: carts } = await query.graph({
      entity: "cart",
      fields: [
        "id",
        "payment_collection.id",
        "payment_collection.payment_sessions.id",
        "payment_collection.payment_sessions.provider_id",
        "payment_collection.payment_sessions.data",
        "payment_collection.payment_sessions.status",
      ],
      filters: {
        id: [cartId],
      },
    })

    if (!carts || carts.length === 0) {
      return res.status(404).json({
        message: `Cart ${cartId} not found`,
      })
    }

    const cart = carts[0]
    const paymentSessions = cart.payment_collection?.payment_sessions || []

    res.json({
      payment_sessions: paymentSessions,
    })
  } catch (error: any) {
    console.error("Error fetching payment sessions:", error)
    res.status(500).json({
      message: "Error fetching payment sessions",
      error: error.message,
    })
  }
}

