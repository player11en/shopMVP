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
    if (origin && allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin)
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

    if (req.method === "OPTIONS") {
      return res.sendStatus(204)
    }
  } catch (err) {
    // fall back silently
  }
  next()
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/carts/:path*",
      middlewares: [storeCorsMiddleware],
    },
  ],
})

