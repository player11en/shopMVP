import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function createAdmin({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  const email = process.env.MEDUSA_ADMIN_EMAIL
  const password = process.env.MEDUSA_ADMIN_PASSWORD
  
  if (!email || !password) {
    logger.info("MEDUSA_ADMIN_EMAIL and MEDUSA_ADMIN_PASSWORD not set. Skipping admin user creation.")
    return
  }
  
  try {
    logger.info(`Creating admin user: ${email}`)
    
    // Use the internal invite workflow approach
    const userModuleService = container.resolve(Modules.USER) as any
    const authModuleService = container.resolve(Modules.AUTH) as any
    
    // Check if user already exists
    const existingUsers = await userModuleService.listUsers({
      email: email
    })
    
    if (existingUsers && existingUsers.length > 0) {
      logger.info(`✅ Admin user already exists: ${email}`)
      return
    }
    
    // Create user first
    const [user] = await userModuleService.createUsers({
      email: email,
      first_name: "Admin",
      last_name: "User"
    })
    
    logger.info(`User created with ID: ${user.id}`)
    
    // Create auth identity linked to the user
    await authModuleService.createAuthIdentities({
      provider: "emailpass",
      entity_id: email,
      provider_metadata: {
        password: password
      },
      user_metadata: {
        actor_id: user.id,
        actor_type: "user"
      },
      app_metadata: {
        user_id: user.id
      }
    })
    
    logger.info("")
    logger.info("=".repeat(60))
    logger.info("✅ ADMIN USER CREATED SUCCESSFULLY")
    logger.info("=".repeat(60))
    logger.info(`Email: ${email}`)
    logger.info(`User ID: ${user.id}`)
    logger.info("")
    logger.info("You can now log in to the admin dashboard!")
    logger.info("=".repeat(60))
    logger.info("")
    
  } catch (error: any) {
    const errorMsg = error?.message || String(error)
    
    // Check if user already exists
    if (errorMsg.includes("already exists") || errorMsg.includes("duplicate") || errorMsg.includes("unique constraint")) {
      logger.info(`✅ Admin user already exists: ${email}`)
      return
    }
    
    logger.warn(`Could not auto-create admin user: ${errorMsg}`)
    logger.info("You can create an admin user manually via the Medusa CLI:")
    logger.info(`npx medusa user --email ${email} --password YOUR_PASSWORD`)
  }
}

