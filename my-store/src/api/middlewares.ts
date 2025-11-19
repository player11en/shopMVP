import { defineMiddlewares } from "@medusajs/framework/http"
import type {
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http"

function storeCorsMiddleware(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  try {
    const configModule = req.scope.resolve("configModule")
    const storeCors =
      configModule.projectConfig?.http?.storeCors || process.env.STORE_CORS || ""
    const allowedOrigins = storeCors
      .split(",")
      .map((o: string) => o.trim())
      .filter(Boolean)

    const origin = req.headers.origin as string | undefined
    
    // Handle preflight OPTIONS request first
    if (req.method === "OPTIONS") {
      if (origin && allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin)
      } else if (allowedOrigins.length === 0) {
        // If no CORS configured, allow all (for development)
        res.header("Access-Control-Allow-Origin", "*")
      }
      res.header("Access-Control-Allow-Credentials", "true")
      res.header(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,PATCH,DELETE,OPTIONS"
      )
      res.header(
        "Access-Control-Allow-Headers",
        req.headers["access-control-request-headers"] ||
          "Content-Type, Authorization, x-publishable-api-key"
      )
      res.header("Access-Control-Max-Age", "86400")
      return res.sendStatus(204)
    }

    // Handle actual request
    if (origin && allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin)
    } else if (allowedOrigins.length === 0) {
      // If no CORS configured, allow all (for development)
      res.header("Access-Control-Allow-Origin", "*")
    }
    res.header("Access-Control-Allow-Credentials", "true")
    res.header(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    )
    res.header(
      "Access-Control-Allow-Headers",
      req.headers["access-control-request-headers"] ||
        "Content-Type, Authorization, x-publishable-api-key"
    )
  } catch (err) {
    // fall back silently - but still set basic CORS headers
    const origin = req.headers.origin as string | undefined
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin)
    }
    res.header("Access-Control-Allow-Credentials", "true")
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-publishable-api-key")
    
    if (req.method === "OPTIONS") {
      return res.sendStatus(204)
    }
  }
  next()
}

export default defineMiddlewares({
  routes: [
    {
      // Apply to all /store/* routes
      matcher: "/store/:path*",
      middlewares: [storeCorsMiddleware],
    },
  ],
})

