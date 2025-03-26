// This file will handle the communication between our Next.js app and Python scraping script
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execPromise = promisify(exec);

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  let method = req.nextUrl.searchParams.get('method') || 'selenium'; // Default to selenium for Cloudflare sites
  
  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }
  
  try {
    // Call the Python script with the URL
    const scriptPath = path.join(process.cwd(), 'scripts', 'scraper.py');
    
    // Create a temporary output file
    const outputFile = path.join(process.cwd(), 'tmp', `scrape_${Date.now()}.json`);
    
    // Make sure the directory exists
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    
    // Run the Python script - use the specified method or default to selenium
    const command = `python "${scriptPath}" --url "${url}" --output "${outputFile}" --method ${method}`;
    console.log('Executing command:', command);
    
    try {
      const { stderr } = await execPromise(command);
      
      if (stderr && !stderr.includes("CAPTCHA DETECTED") && !stderr.includes("Warning: Selenium not available")) {
        console.error('Python script error:', stderr);
        
        // If there's an error with selenium, try again with requests method
        if (method === 'selenium' && (stderr.includes("No module named 'selenium'") || stderr.includes("Error using Selenium"))) {
          console.log('Falling back to requests method');
          method = 'requests';
          const requestsCommand = `python "${scriptPath}" --url "${url}" --output "${outputFile}" --method ${method}`;
          console.log('Executing fallback command:', requestsCommand);
          
          const { stderr: requestsStderr } = await execPromise(requestsCommand);
          if (requestsStderr && !requestsStderr.includes("CAPTCHA DETECTED")) {
            console.error('Python script error (fallback):', requestsStderr);
            return NextResponse.json(
              { error: 'Error running scraper script', details: requestsStderr },
              { status: 500 }
            );
          }
        } else {
          return NextResponse.json(
            { error: 'Error running scraper script', details: stderr },
            { status: 500 }
          );
        }
      }
      
      // Read the output file
      if (fs.existsSync(outputFile)) {
        const data = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
        
        // Clean up the temp file
        fs.unlinkSync(outputFile);
        
        // Check if there was a CAPTCHA that needed manual intervention
        if (stderr && stderr.includes("CAPTCHA DETECTED")) {
          data.captcha_detected = true;
          data.note = "A CAPTCHA was detected and may have required manual intervention";
        }
        
        return NextResponse.json(data);
      } else {
        return NextResponse.json(
          { error: 'Scraper did not produce output' },
          { status: 500 }
        );
      }
    } catch (execError) {
      console.error('Exec error:', execError);
      
      // If original method was selenium and it failed, try with requests
      if (method === 'selenium') {
        console.log('Falling back to requests method after exec error');
        method = 'requests';
        const requestsCommand = `python "${scriptPath}" --url "${url}" --output "${outputFile}" --method ${method}`;
        
        try {
          const { stderr: requestsStderr } = await execPromise(requestsCommand);
          
          // Check if the output file was created
          if (fs.existsSync(outputFile)) {
            const data = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
            
            // Clean up the temp file
            fs.unlinkSync(outputFile);
            
            if (requestsStderr && requestsStderr.includes("CAPTCHA DETECTED")) {
              data.captcha_detected = true;
              data.note = "A CAPTCHA was detected and may have required manual intervention";
            }
            
            return NextResponse.json(data);
          }
        } catch (fallbackError) {
          console.error('Fallback scraper error:', fallbackError);
          return NextResponse.json(
            { 
              error: 'Failed to scrape website with both methods', 
              details: `Original error: ${execError instanceof Error ? execError.message : String(execError)}. Fallback error: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`
            },
            { status: 500 }
          );
        }
      }
      
      throw execError; // Re-throw if fallback wasn't attempted or also failed
    }
  } catch (error) {
    console.error('Scraper API Error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape website', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

