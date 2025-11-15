import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data: regions } = await query.graph({
      entity: "region",
      fields: [
        "id",
        "name",
        "payment_providers.id",
        "payment_providers.provider_id",
      ],
      filters: {
        id: [id],
      },
    })

    if (!regions?.length) {
      return res.status(404).json({
        message: `Region ${id} not found`,
      })
    }

    const region = regions[0]
    const providers = (region.payment_providers || []).map((provider: any) => ({
      id: provider.provider_id || provider.id,
      provider_id: provider.provider_id || provider.id,
    }))

    res.json({
      region: {
        id: region.id,
        name: region.name,
        payment_providers: providers,
      },
    })
  } catch (error: any) {
    res.status(500).json({
      message: "Error fetching payment providers",
      error: error.message,
    })
  }
}

