import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function createAdmin({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  const email = process.env.MEDUSA_ADMIN_EMAIL
  const password = process.env.MEDUSA_ADMIN_PASSWORD
  
  if (!email || !password) {
    logger.warn("MEDUSA_ADMIN_EMAIL and MEDUSA_ADMIN_PASSWORD environment variables are not set. Skipping admin user creation.")
    logger.info("")
    logger.info("To create an admin user, you can:")
    logger.info("1. Set MEDUSA_ADMIN_EMAIL and MEDUSA_ADMIN_PASSWORD environment variables")
    logger.info("2. Or use the admin dashboard UI to create an account")
    logger.info("3. Or call POST /admin/create-admin with email and password")
    logger.info("")
    return
  }
  
  try {
    logger.info(`Attempting to create admin user with email: ${email}`)
    
    // Use the query service to check if user exists
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    
    // Check if auth identity already exists
    const { data: existingAuth } = await query.graph({
      entity: "auth_identity",
      fields: ["id", "entity_id"],
      filters: {
        entity_id: email,
        provider: "emailpass",
      } as any,
    })
    
    if (existingAuth && existingAuth.length > 0) {
      logger.info(`✅ Admin user with email ${email} already exists. Skipping creation.`)
      return
    }
    
    // Get auth module service
    const authModuleService = container.resolve("authService") as any
    
    // Create admin user
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
    
    // Check if user already exists
    if (errorMsg.includes("already exists") || errorMsg.includes("duplicate") || errorMsg.includes("unique constraint")) {
      logger.info(`✅ Admin user with email ${email} already exists. Skipping creation.`)
      return
    }
    
    logger.error(`Error creating admin user: ${errorMsg}`)
    logger.info("")
    logger.info("Note: Admin user creation failed. You can:")
    logger.info("1. Try accessing the admin dashboard and creating an account through the UI")
    logger.info("2. Or call POST /admin/create-admin with email and password")
    logger.info("")
  }
}

