import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createAuthUsersWorkflow } from "@medusajs/medusa/core-flows"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { email, password } = req.body as { email?: string; password?: string }
    
    const adminEmail = email || process.env.MEDUSA_ADMIN_EMAIL || "admin@medusa-test.com"
    const adminPassword = password || process.env.MEDUSA_ADMIN_PASSWORD || "supersecret"
    
    const { result } = await createAuthUsersWorkflow(req.scope).run({
      input: {
        auth_users: [
          {
            email: adminEmail,
            password: adminPassword,
            provider_identities: [
              {
                entity_id: adminEmail,
                provider: "emailpass",
              },
            ],
          },
        ],
      },
    })
    
    res.json({
      success: true,
      message: "Admin user created successfully",
      email: adminEmail,
      password: adminPassword,
    })
  } catch (error: any) {
    if (error.message?.includes("already exists") || error.message?.includes("duplicate")) {
      res.json({
        success: false,
        message: "Admin user already exists",
        error: error.message,
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Error creating admin user",
        error: error.message,
      })
    }
  }
}

