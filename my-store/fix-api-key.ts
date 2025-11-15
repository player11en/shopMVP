import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { 
  createApiKeysWorkflow,
  linkSalesChannelsToApiKeyWorkflow 
} from "@medusajs/medusa/core-flows";

export default async function fixApiKey({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);

  try {
    logger.info("Checking for existing API keys...");
    
    // Get all API keys
    const { data: apiKeys } = await query.graph({
      entity: "api_key",
      fields: ["id", "title", "type", "token"],
      filters: {
        type: "publishable",
      },
    });

    logger.info(`Found ${apiKeys?.length || 0} publishable API keys`);

    // Get default sales channel
    const defaultSalesChannels = await salesChannelModuleService.listSalesChannels({
      name: "Default Sales Channel",
    });

    if (!defaultSalesChannels || defaultSalesChannels.length === 0) {
      logger.error("No default sales channel found!");
      return;
    }

    const defaultSalesChannel = defaultSalesChannels[0];
    logger.info(`Default Sales Channel ID: ${defaultSalesChannel.id}`);

    let publishableApiKey;

    if (!apiKeys || apiKeys.length === 0) {
      logger.info("No API key found. Creating new one...");
      
      // Create new API key
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
      });
      
      publishableApiKey = publishableApiKeyResult[0];
      logger.info(`Created new API key: ${publishableApiKey.id}`);
      
      // Link to sales channel
      await linkSalesChannelsToApiKeyWorkflow(container).run({
        input: {
          id: publishableApiKey.id,
          add: [defaultSalesChannel.id],
        },
      });
      
      logger.info("Linked API key to default sales channel");
    } else {
      publishableApiKey = apiKeys[0];
      logger.info(`Using existing API key: ${publishableApiKey.id}`);
      
      // Try to link to sales channel (will skip if already linked)
      try {
        await linkSalesChannelsToApiKeyWorkflow(container).run({
          input: {
            id: publishableApiKey.id,
            add: [defaultSalesChannel.id],
          },
        });
        logger.info("Ensured API key is linked to default sales channel");
      } catch (error) {
        logger.info("API key might already be linked to sales channel");
      }
    }

    // Output the key
    logger.info("");
    logger.info("=".repeat(70));
    logger.info("✅ API KEY READY");
    logger.info("=".repeat(70));
    logger.info("");
    logger.info(`Copy this API key: ${publishableApiKey.id}`);
    logger.info("");
    logger.info("Update your storefront with this key:");
    logger.info(`  File: storefront/lib/medusa.ts`);
    logger.info(`  Set: MEDUSA_API_KEY = "${publishableApiKey.id}"`);
    logger.info("");
    logger.info("Test with:");
    logger.info(`  curl -H "x-publishable-api-key: ${publishableApiKey.id}" http://localhost:9000/store/products`);
    logger.info("");
    logger.info("=".repeat(70));
    logger.info("");

  } catch (error: any) {
    logger.error("Error:", error?.message || error);
    if (error.stack) {
      logger.error("Stack:", error.stack);
    }
  }
}

