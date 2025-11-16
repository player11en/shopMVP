import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  
  const { email, password } = req.body as { email: string; password: string }
  
  if (!email || !password) {
    return res.status(400).json({ 
      message: "Email and password are required" 
    })
  }
  
  try {
    logger.info(`Creating admin user with email: ${email}`)
    
    // Get auth module service
    const authModuleService = req.scope.resolve(Modules.AUTH) as any
    
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
    
    logger.info(`✅ Admin user created: ${email}`)
    
    return res.json({ 
      message: "Admin user created successfully",
      email: email 
    })
    
  } catch (error: any) {
    const errorMsg = error?.message || String(error)
    logger.error(`Error creating admin user: ${errorMsg}`)
    
    // Check if user already exists
    if (errorMsg.includes("already exists") || errorMsg.includes("duplicate") || errorMsg.includes("unique constraint")) {
      return res.status(409).json({ 
        message: "Admin user already exists",
        email: email 
      })
    }
    
    return res.status(500).json({ 
      message: "Failed to create admin user",
      error: errorMsg 
    })
  }
}

