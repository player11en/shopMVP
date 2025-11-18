import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

export async function POST(req: NextRequest) {
  try {
    const { path, method = "GET", headers = {}, body = null } = await req.json()

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
    let responseBody: BodyInit
    if (isJson) {
      responseBody = JSON.stringify(await response.json())
    } else {
      responseBody = await response.text()
    }

    const nextResponse = new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
    })

    // Copy headers but exclude content-encoding to avoid decoding issues
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase()
      // Skip content-encoding and content-length as we're handling the body ourselves
      if (lowerKey !== "content-encoding" && lowerKey !== "content-length") {
        nextResponse.headers.set(key, value)
      }
    })

    // Set content type if JSON
    if (isJson) {
      nextResponse.headers.set("Content-Type", "application/json")
    }

    if (!nextResponse.headers.has("Access-Control-Allow-Origin")) {
      nextResponse.headers.set("Access-Control-Allow-Origin", "*")
    }

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

