import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createApiKeysWorkflow, linkSalesChannelsToApiKeyWorkflow } from "@medusajs/medusa/core-flows"

export default async function createApiKey({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  try {
    logger.info("Creating publishable API key...")
    
    // Get sales channel service to find default channel
    const salesChannelModuleService = container.resolve("salesChannelService")
    const [salesChannels] = await salesChannelModuleService.listAndCount({})
    
    if (salesChannels.length === 0) {
      logger.warn("No sales channels found. Please run 'npm run seed' first to create a default sales channel.")
      return
    }
    
    const defaultSalesChannel = salesChannels[0]
    logger.info(`Linking API key to sales channel: ${defaultSalesChannel.name || defaultSalesChannel.id}`)
    
    // Create API key
    const { result: publishableApiKeyResult } = await createApiKeysWorkflow(
      container
    ).run({
      input: {
        api_keys: [
          {
            title: "Webshop",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    })
    
    const publishableApiKey = publishableApiKeyResult[0]
    
    // Link API key to sales channel
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: {
        id: publishableApiKey.id,
        add: [defaultSalesChannel.id],
      },
    })
    
    logger.info("")
    logger.info("=".repeat(60))
    logger.info("✅ PUBLISHABLE API KEY CREATED & LINKED")
    logger.info("=".repeat(60))
    logger.info(`ID: ${publishableApiKey.id}`)
    logger.info(`Title: ${publishableApiKey.title}`)
    logger.info(`Type: ${publishableApiKey.type}`)
    logger.info(`Linked to sales channel: ${defaultSalesChannel.name || defaultSalesChannel.id}`)
    logger.info("")
    logger.info("Use this key in your API requests:")
    logger.info(`x-publishable-api-key: ${publishableApiKey.id}`)
    logger.info("")
    logger.info("Example:")
    logger.info(`curl -H "x-publishable-api-key: ${publishableApiKey.id}" http://localhost:9000/store/products`)
    logger.info("=".repeat(60))
    logger.info("")
    
    return publishableApiKey.id
  } catch (error: any) {
    logger.error("Error creating API key:", error?.message || error)
    throw error
  }
}

