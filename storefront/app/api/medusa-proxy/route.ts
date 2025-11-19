import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

// Handle OPTIONS (CORS preflight)
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-publishable-api-key",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// Handle GET requests (for testing/debugging)
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const path = searchParams.get("path");
  
  // If no path provided, return helpful error message
  if (!path) {
    return NextResponse.json(
      {
        message: "Proxy path is required",
        usage: "Use POST method with JSON body: { path, method, headers, body }",
        example: "POST /api/medusa-proxy with body: { \"path\": \"/store/products\", \"method\": \"GET\", \"headers\": {}, \"body\": null }"
      },
      { status: 400 }
    );
  }
  
  const method = searchParams.get("method") || "GET";
  const headers = JSON.parse(searchParams.get("headers") || "{}");
  
  return handleProxyRequest({
    path,
    method,
    headers,
    body: null,
  }, req);
}

// Handle POST requests
export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { path, method = "GET", headers = {}, body = null } = requestBody;
    
    // Validate path is provided
    if (!path) {
      return NextResponse.json(
        {
          message: "Proxy path is required",
          received: requestBody,
          usage: "POST body must include: { path: '/store/products', method: 'GET', headers: {}, body: null }"
        },
        { status: 400 }
      );
    }
    
    return handleProxyRequest({ path, method, headers, body }, req);
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Invalid request body",
        error: error.message,
        usage: "POST body must be valid JSON: { path: '/store/products', method: 'GET', headers: {}, body: null }"
      },
      { status: 400 }
    );
  }
}

async function handleProxyRequest({ path, method, headers, body }: {
  path: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
}, req: NextRequest) {
  try {
    const origin = req.headers.get("origin");

    if (!path) {
      return NextResponse.json(
        { message: "Proxy path is required" },
        { status: 400 }
      )
    }

    const targetUrl = `${BACKEND_URL}${path}`
    const forwardHeaders = new Headers(headers as Record<string, string>)

    // Ensure API key is always forwarded
    const apiKey = process.env.NEXT_PUBLIC_MEDUSA_API_KEY || headers["x-publishable-api-key"];
    if (apiKey && !forwardHeaders.has("x-publishable-api-key")) {
      forwardHeaders.set("x-publishable-api-key", apiKey);
    }

    const fetchInit: RequestInit = {
      method,
      headers: forwardHeaders,
    }

    if (body) {
      fetchInit.body = typeof body === "string" ? body : JSON.stringify(body)
    }

    const response = await fetch(targetUrl, fetchInit)
    
    // Get content type to handle response properly
    const contentType = response.headers.get("content-type") || ""
    const isJson = contentType.includes("application/json")
    
    // Handle response body based on content type
    let nextResponse: NextResponse
    if (isJson) {
      // Parse JSON and return it properly (don't double-stringify)
      const jsonData = await response.json()
      nextResponse = NextResponse.json(jsonData, {
        status: response.status,
        statusText: response.statusText,
      })
    } else {
      // For non-JSON responses, return as text
      const textData = await response.text()
      nextResponse = new NextResponse(textData, {
        status: response.status,
        statusText: response.statusText,
      })
    }

    // Copy headers but exclude content-encoding and content-length to avoid decoding issues
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase()
      // Skip content-encoding and content-length as NextResponse handles these automatically
      if (lowerKey !== "content-encoding" && lowerKey !== "content-length" && lowerKey !== "content-type") {
        nextResponse.headers.set(key, value)
      }
    })

    // Set CORS headers - use actual origin, not wildcard (required for credentials)
    if (!nextResponse.headers.has("Access-Control-Allow-Origin")) {
      nextResponse.headers.set("Access-Control-Allow-Origin", origin || "*");
    }
    nextResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    nextResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-publishable-api-key");
    nextResponse.headers.set("Access-Control-Allow-Credentials", "true");

    return nextResponse
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

