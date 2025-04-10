// This API route is no longer needed since we're removing external API dependencies
// We're creating a static implementation that doesn't rely on external services

export async function GET() {
  return new Response(
    JSON.stringify({ 
      success: false, 
      message: "This endpoint has been disabled as part of moving to a static implementation." 
    }),
    { 
      status: 410, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}

export async function POST() {
  return new Response(
    JSON.stringify({ 
      success: false, 
      message: "This endpoint has been disabled as part of moving to a static implementation." 
    }),
    { 
      status: 410, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}