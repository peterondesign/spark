// This file will handle the communication between our Next.js app and Python scraping script
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execPromise = promisify(exec);

// This API route is no longer needed since we're removing external scraping functionality
// We're creating a static implementation that doesn't rely on external API calls

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

