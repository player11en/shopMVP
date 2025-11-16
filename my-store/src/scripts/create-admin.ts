import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function createAdmin({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  const email = process.env.MEDUSA_ADMIN_EMAIL
  const password = process.env.MEDUSA_ADMIN_PASSWORD
  
  if (!email || !password) {
    logger.warn("MEDUSA_ADMIN_EMAIL and MEDUSA_ADMIN_PASSWORD environment variables are not set.")
    logger.info("")
    logger.info("To create an admin user:")
    logger.info("1. Go to your admin dashboard: https://your-backend.onrender.com/app")
    logger.info("2. Create an account using the signup form")
    logger.info("")
    return
  }
  
  try {
    logger.info(`Creating admin user: ${email}`)
    
    // Get auth module service
    const authModuleService = container.resolve(Modules.AUTH) as any
    
    // Try to create the admin user directly
    await authModuleService.createAuthIdentities({
      provider: "emailpass",
      entity_id: email,
      provider_metadata: {
        email: email,
        password: password,
      } as any,
    } as any)
    
    logger.info("")
    logger.info("=".repeat(60))
    logger.info("✅ ADMIN USER CREATED SUCCESSFULLY")
    logger.info("=".repeat(60))
    logger.info(`Email: ${email}`)
    logger.info("")
    logger.info("You can now log in to the admin dashboard.")
    logger.info("=".repeat(60))
    logger.info("")
    
  } catch (error: any) {
    const errorMsg = error?.message || String(error)
    
    // Check if user already exists
    if (errorMsg.includes("already exists") || errorMsg.includes("duplicate") || errorMsg.includes("unique constraint")) {
      logger.info(`ℹ️  Admin user already exists: ${email}`)
      logger.info("You can log in to the admin dashboard with your existing credentials.")
      return
    }
    
    // Log the error but don't fail the startup
    logger.warn(`Could not auto-create admin user: ${errorMsg}`)
    logger.info("")
    logger.info("Please create an admin account manually:")
    logger.info("1. Go to your admin dashboard: /app")
    logger.info("2. Sign up using the form")
    logger.info("")
  }
}

