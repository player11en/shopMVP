import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function getApiKey({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  try {
    // Try to get API key module service
    const apiKeyModuleService = container.resolve("apiKey") as any
    
    const [apiKeys] = await apiKeyModuleService.listAndCount({
      type: "publishable",
    })

    if (apiKeys && apiKeys.length > 0) {
      const apiKey = apiKeys[0]
      logger.info("")
      logger.info("=".repeat(60))
      logger.info("🔑 PUBLISHABLE API KEY FOUND")
      logger.info("=".repeat(60))
      logger.info(`ID: ${apiKey.id}`)
      logger.info(`Title: ${apiKey.title || "N/A"}`)
      logger.info(`Type: ${apiKey.type}`)
      logger.info("")
      logger.info("Use this key in your API requests:")
      logger.info(`x-publishable-api-key: ${apiKey.id}`)
      logger.info("")
      logger.info("Example:")
      logger.info(`curl -H "x-publishable-api-key: ${apiKey.id}" http://localhost:9000/store/products`)
      logger.info("=".repeat(60))
      logger.info("")
      return apiKey.id
    } else {
      logger.warn("No publishable API key found. Run 'npm run seed' first.")
      logger.info("")
      logger.info("To create an API key, you can:")
      logger.info("1. Run: npm run seed (creates a default key)")
      logger.info("2. Use the Admin Dashboard (after setup)")
      logger.info("3. Create one via API (requires admin authentication)")
      logger.info("")
    }
  } catch (error: any) {
    logger.error("Error retrieving API key:", error?.message || error)
    logger.info("")
    logger.info("Trying alternative method...")
    
    // Alternative: Check if we need to re-seed
    logger.info("If no API key exists, run: npm run seed")
  }
}

