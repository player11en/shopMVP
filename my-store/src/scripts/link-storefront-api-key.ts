import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { 
  linkSalesChannelsToApiKeyWorkflow 
} from "@medusajs/medusa/core-flows";

// Storefront API key token
const STOREFRONT_API_KEY = "pk_e5cf6887065474a34a6876ae4a1d17676a1ef068d0a51f97f9eff9f2cf10b91a";

export default async function linkStorefrontApiKey({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);

  try {
    logger.info("Linking storefront API key to sales channel...");
    
    // Get all API keys
    const { data: apiKeys } = await query.graph({
      entity: "api_key",
      fields: ["id", "title", "type", "token"],
      filters: {
        type: "publishable",
      },
    });

    logger.info(`Found ${apiKeys?.length || 0} publishable API keys`);

    // Find the storefront API key
    const storefrontApiKey = apiKeys?.find((key: any) => 
      key.token === STOREFRONT_API_KEY || key.id === STOREFRONT_API_KEY
    );

    if (!storefrontApiKey) {
      logger.error(`Storefront API key not found: ${STOREFRONT_API_KEY}`);
      logger.info("Available API keys:");
      apiKeys?.forEach((key: any) => {
        logger.info(`  - ${key.title || 'Untitled'}: ${key.id} (token: ${key.token?.substring(0, 20)}...)`);
      });
      return;
    }

    logger.info(`Found storefront API key: ${storefrontApiKey.title || storefrontApiKey.id}`);

    // Get default sales channel
    const salesChannels = await salesChannelModuleService.listSalesChannels({});
    
    if (!salesChannels || salesChannels.length === 0) {
      logger.error("No sales channels found! Please run 'npm run seed' first.");
      return;
    }

    const defaultSalesChannel = salesChannels[0];
    logger.info(`Using sales channel: ${defaultSalesChannel.name || defaultSalesChannel.id}`);

    // Link API key to sales channel
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: {
        id: storefrontApiKey.id,
        add: [defaultSalesChannel.id],
      },
    });

    logger.info("");
    logger.info("=".repeat(70));
    logger.info("✅ STOREFRONT API KEY LINKED TO SALES CHANNEL");
    logger.info("=".repeat(70));
    logger.info(`API Key ID: ${storefrontApiKey.id}`);
    logger.info(`Sales Channel: ${defaultSalesChannel.name || defaultSalesChannel.id}`);
    logger.info("");
    logger.info("The storefront should now work correctly!");
    logger.info("=".repeat(70));
    logger.info("");

  } catch (error: any) {
    logger.error("Error:", error?.message || error);
    if (error.stack) {
      logger.error("Stack:", error.stack);
    }
  }
}

