import { NextRequest, NextResponse } from 'next/server';

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
// Support both environment variable names for flexibility
const MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_API_KEY || process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, method = 'GET', headers: customHeaders = {}, body: requestBody } = body;

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    if (!MEDUSA_PUBLISHABLE_KEY) {
      console.error('❌ NEXT_PUBLIC_MEDUSA_API_KEY or NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not set');
      return NextResponse.json(
        { error: 'Medusa publishable key not configured' },
        { status: 500 }
      );
    }

    const url = `${MEDUSA_BACKEND_URL}${path}`;
    const upperMethod = method.toUpperCase();
    
    console.log(`🔄 Proxying ${upperMethod} request to:`, url);
    
    const fetchOptions: RequestInit = {
      method: upperMethod,
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
        ...customHeaders,
      },
    };

    // Only add body for methods that support it
    if (requestBody !== null && requestBody !== undefined && !['GET', 'HEAD'].includes(upperMethod)) {
      fetchOptions.body = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody);
    }
    
    const response = await fetch(url, fetchOptions);
    
    // Get the response text first
    const text = await response.text();
    
    // Try to parse as JSON, fallback to returning error info
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      // If response is not JSON, it might be HTML error page or plain text
      console.error('❌ Medusa response is not JSON:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        preview: text.substring(0, 200)
      });
      
      // Preserve the original status code from Medusa
      return NextResponse.json(
        { 
          error: 'Invalid response from Medusa backend',
          message: text.substring(0, 500),
          url,
          status: response.status,
          statusText: response.statusText
        },
        { status: response.status } // Preserve original status code
      );
    }

    // Log success or error
    if (response.ok) {
      console.log(`✅ Proxy response status: ${response.status}`);
    } else {
      console.error(`❌ Medusa backend error: ${response.status}`, {
        url,
        error: data.error || data.message || 'Unknown error',
        data: JSON.stringify(data).substring(0, 200)
      });
    }
    
    // Preserve the original status code from Medusa (don't always return 200)
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { 
        error: 'Proxy request failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    if (!MEDUSA_PUBLISHABLE_KEY) {
      console.error('❌ NEXT_PUBLIC_MEDUSA_API_KEY or NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not set');
      return NextResponse.json(
        { error: 'Medusa publishable key not configured' },
        { status: 500 }
      );
    }

    const url = `${MEDUSA_BACKEND_URL}${path}`;
    
    console.log(`🔄 Proxying GET request to:`, url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
      },
    });

    const text = await response.text();
    
    // Try to parse as JSON
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error('❌ Medusa response is not JSON:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        preview: text.substring(0, 200)
      });
      
      // Preserve the original status code from Medusa
      return NextResponse.json(
        { 
          error: 'Invalid response from Medusa backend',
          message: text.substring(0, 500),
          url,
          status: response.status,
          statusText: response.statusText
        },
        { status: response.status } // Preserve original status code
      );
    }

    // Log success or error
    if (response.ok) {
      console.log(`✅ Proxy response status: ${response.status}`);
    } else {
      console.error(`❌ Medusa backend error: ${response.status}`, {
        url,
        error: data.error || data.message || 'Unknown error',
        data: JSON.stringify(data).substring(0, 200)
      });
    }
    
    // Preserve the original status code from Medusa
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { 
        error: 'Proxy request failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

