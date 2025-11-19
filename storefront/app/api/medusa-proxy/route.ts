import { NextRequest, NextResponse } from "next/server"

// Force this to be a dynamic route (not statically generated)
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"

type ProxyPayload = {
  path: string
  method?: string
  headers?: Record<string, string>
  body?: any
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as ProxyPayload
    const { path, method = "GET", headers = {}, body } = payload

    if (!path) {
      return NextResponse.json(
        { message: "Missing `path` in medusa-proxy payload" },
        { status: 400 }
      )
    }

    // Build target URL safely
    const targetUrl = new URL(path, MEDUSA_BACKEND_URL).toString()

    // Prepare headers - ensure API key is always included
    const forwardHeaders = new Headers(headers as Record<string, string>)
    const apiKey = process.env.NEXT_PUBLIC_MEDUSA_API_KEY || headers?.["x-publishable-api-key"]
    if (apiKey && !forwardHeaders.has("x-publishable-api-key")) {
      forwardHeaders.set("x-publishable-api-key", apiKey)
    }

    const upperMethod = method.toUpperCase()
    const hasBody = !["GET", "HEAD"].includes(upperMethod)

    // Forward request to backend
    const backendRes = await fetch(targetUrl, {
      method: upperMethod,
      headers: forwardHeaders,
      body:
        hasBody && body != null
          ? typeof body === "string"
            ? body
            : JSON.stringify(body)
          : undefined,
      redirect: "manual",
    })

    // Get response body as array buffer (handles all content types)
    const resBody = await backendRes.arrayBuffer()
    const resHeaders = new Headers()

    // Copy headers but exclude problematic ones
    backendRes.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase()
      // Skip content-encoding, content-length, and transfer-encoding
      // NextResponse will handle these automatically
      if (
        lowerKey !== "content-encoding" &&
        lowerKey !== "content-length" &&
        lowerKey !== "transfer-encoding"
      ) {
        resHeaders.set(key, value)
      }
    })

    // Set content-type if not already set
    if (!resHeaders.has("content-type")) {
      resHeaders.set("content-type", backendRes.headers.get("content-type") || "application/json")
    }

    // Set CORS headers for browser requests
    const origin = req.headers.get("origin")
    if (origin) {
      resHeaders.set("Access-Control-Allow-Origin", origin)
      resHeaders.set("Access-Control-Allow-Credentials", "true")
    }

    return new NextResponse(resBody, {
      status: backendRes.status,
      headers: resHeaders,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Proxy request failed",
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// Handle GET requests (for testing/debugging)
export async function GET(req: NextRequest) {
  return NextResponse.json(
    {
      message: "Medusa Proxy Route",
      usage: "Use POST method with JSON body",
      example: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: {
          path: "/store/products",
          method: "GET",
          headers: {},
          body: null,
        },
      },
      test: "curl -X POST https://storefront-tg3r.onrender.com/api/medusa-proxy -H 'Content-Type: application/json' -d '{\"path\":\"/store/products\",\"method\":\"GET\",\"headers\":{}}'",
    },
    { status: 200 }
  )
}

// Handle OPTIONS (CORS preflight)
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin")
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-publishable-api-key",
      "Access-Control-Max-Age": "86400",
    },
  })
}

