import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createAuthUsersWorkflow } from "@medusajs/medusa/core-flows"

export default async function createAdmin({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  try {
    const email = process.env.MEDUSA_ADMIN_EMAIL || "admin@medusa-test.com"
    const password = process.env.MEDUSA_ADMIN_PASSWORD || "supersecret"
    
    logger.info("Creating admin user...")
    logger.info(`Email: ${email}`)
    
    const { result } = await createAuthUsersWorkflow(container).run({
      input: {
        auth_users: [
          {
            email,
            password,
            provider_identities: [
              {
                entity_id: email,
                provider: "emailpass",
              },
            ],
          },
        ],
      },
    })
    
    const adminUser = result[0]
    
    logger.info("")
    logger.info("=".repeat(60))
    logger.info("✅ ADMIN USER CREATED")
    logger.info("=".repeat(60))
    logger.info(`Email: ${adminUser.email}`)
    logger.info(`Password: ${password}`)
    logger.info("")
    logger.info("You can now login to the admin dashboard at:")
    logger.info("https://medusa-backend-e42r.onrender.com/app")
    logger.info("")
    logger.info("=".repeat(60))
    logger.info("")
    
    return adminUser
  } catch (error: any) {
    if (error.message?.includes("already exists") || error.message?.includes("duplicate")) {
      logger.warn("Admin user already exists. Skipping creation.")
      logger.info("")
      logger.info("If you forgot your password, you can reset it via the admin dashboard.")
      return null
    }
    logger.error("Error creating admin user:", error?.message || error)
    throw error
  }
}

