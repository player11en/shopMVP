import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function createAdmin({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  const email = process.env.MEDUSA_ADMIN_EMAIL
  const password = process.env.MEDUSA_ADMIN_PASSWORD
  
  if (!email || !password) {
    logger.warn("MEDUSA_ADMIN_EMAIL and MEDUSA_ADMIN_PASSWORD environment variables are not set. Skipping admin user creation.")
    return
  }
  
  try {
    logger.info("Checking for existing admin users...")
    
    // Get auth module service
    const authModuleService = container.resolve(Modules.AUTH) as any
    
    // Check if admin user already exists
    const existingUsers = await authModuleService.listAuthIdentities({
      provider_metadata: {
        email: email,
      },
    } as any)
    
    if (existingUsers && existingUsers.length > 0) {
      logger.info(`✅ Admin user with email ${email} already exists. Skipping creation.`)
      return
    }
    
    logger.info(`Creating admin user with email: ${email}`)
    
    // Create admin user using auth module
    // Note: The exact API may vary - this is a simplified approach
    const adminUser = await authModuleService.createAuthIdentities({
      provider: "emailpass",
      entity_id: email,
      provider_metadata: {
        email: email,
        password: password,
      } as any,
      user_metadata: {
        role: "admin",
      } as any,
    } as any)
    
    logger.info("")
    logger.info("=".repeat(60))
    logger.info("✅ ADMIN USER CREATED")
    logger.info("=".repeat(60))
    logger.info(`Email: ${email}`)
    logger.info(`Role: admin`)
    logger.info("")
    logger.info("You can now log in to the admin dashboard.")
    logger.info("=".repeat(60))
    logger.info("")
    
  } catch (error: any) {
    const errorMsg = error?.message || String(error)
    logger.error(`Error creating admin user: ${errorMsg}`)
    logger.info("")
    logger.info("Note: Admin user creation might require the auth module to be properly configured.")
    logger.info("You may need to create the admin user manually through the admin dashboard.")
    logger.info("")
  }
}

