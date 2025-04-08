import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import * as https from 'https';
import { NextRequest, NextResponse } from 'next/server';

const IMAGE_CACHE_DIR = path.join(process.cwd(), 'public/image-cache');
const CACHE_MANIFEST_PATH = path.join(IMAGE_CACHE_DIR, 'manifest.json');
const MAX_CACHE_SIZE = 1000; // Maximum number of images to cache
const CACHE_CLEANUP_FREQUENCY = 7 * 24 * 60 * 60 * 1000; // 7 days
const CACHE_REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour - time before refreshing image from source

interface CachedImageInfo {
  originalUrl: string;
  localPath: string;
  savedAt: number;
  lastAccessed: number;
  accessCount: number;
}

interface CacheManifest {
  images: Record<string, CachedImageInfo>;
  lastCleanup: number;
}

// Initialize cache directory and manifest
function initializeCache(): CacheManifest {
  try {
    if (!fs.existsSync(IMAGE_CACHE_DIR)) {
      fs.mkdirSync(IMAGE_CACHE_DIR, { recursive: true });
      return { images: {}, lastCleanup: Date.now() };
    }
    
    if (fs.existsSync(CACHE_MANIFEST_PATH)) {
      const manifest = JSON.parse(fs.readFileSync(CACHE_MANIFEST_PATH, 'utf-8'));
      return manifest;
    }
    
    return { images: {}, lastCleanup: Date.now() };
  } catch (error) {
    console.error('Error initializing image cache:', error);
    return { images: {}, lastCleanup: Date.now() };
  }
}

// Get the cache manifest
function getCacheManifest(): CacheManifest {
  return initializeCache();
}

// Save the cache manifest
function saveCacheManifest(manifest: CacheManifest) {
  try {
    fs.writeFileSync(CACHE_MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  } catch (error) {
    console.error('Error saving cache manifest:', error);
  }
}

// Generate a unique filename for an image URL
function getImageKey(url: string): string {
  return createHash('md5').update(url).digest('hex');
}

// Check if an image needs to be refreshed based on its age
function shouldRefreshImage(imageInfo: CachedImageInfo): boolean {
  return Date.now() - imageInfo.savedAt > CACHE_REFRESH_INTERVAL;
}

// Download and save an image to the local cache
export async function cacheImage(imageUrl: string, force: boolean = false): Promise<string | null> {
  const manifest = getCacheManifest();
  const imageKey = getImageKey(imageUrl);
  
  // Check if the image is already cached
  if (manifest.images[imageKey] && !force) {
    const imageInfo = manifest.images[imageKey];
    
    // Update last accessed time and count
    imageInfo.lastAccessed = Date.now();
    imageInfo.accessCount += 1;
    
    // If the image is older than our refresh interval, trigger a background refresh
    // but still return the existing cached version immediately
    if (shouldRefreshImage(imageInfo)) {
      // This runs the refresh asynchronously without waiting
      refreshCachedImage(imageUrl, imageKey, manifest);
    }
    
    saveCacheManifest(manifest);
    
    // Return the local path to the cached image
    return `/image-cache/${path.basename(imageInfo.localPath)}`;
  }
  
  // Get file extension from URL
  const urlObj = new URL(imageUrl);
  const extension = path.extname(urlObj.pathname) || '.jpg';
  const localFilename = `${imageKey}${extension}`;
  const localPath = path.join(IMAGE_CACHE_DIR, localFilename);
  
  try {
    // Download and save the image
    await new Promise<void>((resolve, reject) => {
      https.get(imageUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }
        
        const fileStream = fs.createWriteStream(localPath);
        
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
        
        fileStream.on('error', (err) => {
          fs.unlinkSync(localPath);
          reject(err);
        });
      }).on('error', reject);
    });
    
    // Add to manifest
    manifest.images[imageKey] = {
      originalUrl: imageUrl,
      localPath: localFilename,
      savedAt: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 1
    };
    
    // Clean up cache if needed
    if (Date.now() - manifest.lastCleanup > CACHE_CLEANUP_FREQUENCY) {
      cleanupCache();
    }
    
    saveCacheManifest(manifest);
    
    return `/image-cache/${localFilename}`;
  } catch (error) {
    console.error(`Error caching image ${imageUrl}:`, error);
    return null;
  }
}

// Refresh an image in the background without waiting for completion
async function refreshCachedImage(imageUrl: string, imageKey: string, manifest: CacheManifest) {
  try {
    const urlObj = new URL(imageUrl);
    const extension = path.extname(urlObj.pathname) || '.jpg';
    const localFilename = `${imageKey}${extension}`;
    const localPath = path.join(IMAGE_CACHE_DIR, localFilename);

    // Download the fresh image
    await new Promise<void>((resolve, reject) => {
      https.get(imageUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to refresh image: ${response.statusCode}`));
          return;
        }
        
        const tempPath = `${localPath}.temp`;
        const fileStream = fs.createWriteStream(tempPath);
        
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          
          // Replace the old file with the new one
          try {
            fs.renameSync(tempPath, localPath);
            
            // Update the manifest
            if (manifest.images[imageKey]) {
              manifest.images[imageKey].savedAt = Date.now();
              saveCacheManifest(manifest);
            }
          } catch (err) {
            console.error('Error replacing cached image:', err);
            // Try to clean up the temp file
            if (fs.existsSync(tempPath)) {
              fs.unlinkSync(tempPath);
            }
          }
          
          resolve();
        });
        
        fileStream.on('error', (err) => {
          if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
          }
          reject(err);
        });
      }).on('error', reject);
    });
  } catch (error) {
    console.error(`Error refreshing cached image ${imageUrl}:`, error);
    // Non-critical error, we can just continue using the old cached version
  }
}

// Get a cached image or fetch and cache if it doesn't exist
export async function getOrCacheImage(imageUrl: string): Promise<string> {
  const cachedPath = await cacheImage(imageUrl);
  return cachedPath || imageUrl; // Fall back to original URL if caching fails
}

// Generate cache headers for browser caching
function generateCacheHeaders(imageAge: number) {
  // If the image was cached/refreshed recently, set longer cache time
  const maxAge = imageAge < CACHE_REFRESH_INTERVAL ? 86400 : 3600; // 24 hours or 1 hour
  
  return {
    'Cache-Control': `public, max-age=${maxAge}`,
    'X-Cache-Date': new Date().toISOString(),
  };
}

// Serve a cached image directly
export async function serveCachedImage(req: NextRequest, imageKey: string): Promise<NextResponse> {
  const manifest = getCacheManifest();
  
  if (!manifest.images[imageKey]) {
    return NextResponse.json({ error: 'Image not found in cache' }, { status: 404 });
  }
  
  const imageInfo = manifest.images[imageKey];
  const localPath = path.join(IMAGE_CACHE_DIR, imageInfo.localPath);
  
  try {
    // Check if file exists
    if (!fs.existsSync(localPath)) {
      delete manifest.images[imageKey];
      saveCacheManifest(manifest);
      return NextResponse.json({ error: 'Cached image file not found' }, { status: 404 });
    }
    
    // Update access info
    imageInfo.lastAccessed = Date.now();
    imageInfo.accessCount += 1;
    saveCacheManifest(manifest);
    
    // Determine if we should refresh based on age (but still serve old version immediately)
    if (shouldRefreshImage(imageInfo)) {
      // Asynchronously refresh without waiting
      refreshCachedImage(imageInfo.originalUrl, imageKey, manifest);
    }
    
    // Read file
    const imageBuffer = fs.readFileSync(localPath);
    const contentType = getContentTypeFromExtension(path.extname(localPath));
    const imageAge = Date.now() - imageInfo.savedAt;
    const cacheHeaders = generateCacheHeaders(imageAge);
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        ...cacheHeaders,
        'Content-Length': imageBuffer.length.toString()
      }
    });
  } catch (error) {
    console.error(`Error serving cached image ${imageKey}:`, error);
    return NextResponse.json({ error: 'Error reading cached image' }, { status: 500 });
  }
}

// Helper to get content type from file extension
function getContentTypeFromExtension(extension: string): string {
  switch (extension.toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}

// Cleanup old or unused images
export function cleanupCache() {
  const manifest = getCacheManifest();
  const imageEntries = Object.entries(manifest.images);
  
  // If we're under the limit, just update the cleanup timestamp
  if (imageEntries.length <= MAX_CACHE_SIZE) {
    manifest.lastCleanup = Date.now();
    saveCacheManifest(manifest);
    return;
  }
  
  // Score images based on access count, recency, and age
  const scoredEntries = imageEntries.map(([key, info]) => {
    // Score formula weights:
    // - Higher access count is better
    // - More recent access is better
    // - Newer images are better
    const accessRecency = (Date.now() - info.lastAccessed) / (24 * 60 * 60 * 1000); // days since last access
    const accessScore = Math.min(info.accessCount, 100) / 100; // normalize access count (cap at 100)
    const ageScore = Math.max(0, 30 - (Date.now() - info.savedAt) / (24 * 60 * 60 * 1000)) / 30; // age in days (newer is better)
    
    // Combined score (higher is better to keep)
    const score = (accessScore * 0.5) + (1 / (accessRecency + 1) * 0.3) + (ageScore * 0.2);
    
    return { key, info, score };
  });
  
  // Sort by score (lowest first - will be removed)
  scoredEntries.sort((a, b) => a.score - b.score);
  
  // Calculate how many to remove
  const imagesToRemove = imageEntries.length - MAX_CACHE_SIZE;
  
  // Remove lowest scoring images
  for (let i = 0; i < imagesToRemove; i++) {
    const { key, info } = scoredEntries[i];
    const localPath = path.join(IMAGE_CACHE_DIR, info.localPath);
    
    try {
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
      delete manifest.images[key];
    } catch (error) {
      console.error(`Error removing cached image ${key}:`, error);
    }
  }
  
  manifest.lastCleanup = Date.now();
  saveCacheManifest(manifest);
}

// Get cache statistics
export function getCacheStats() {
  const manifest = getCacheManifest();
  const imageCount = Object.keys(manifest.images).length;
  
  let totalSize = 0;
  let oldestImage = Date.now();
  let newestImage = 0;
  
  for (const key in manifest.images) {
    const imageInfo = manifest.images[key];
    const localPath = path.join(IMAGE_CACHE_DIR, imageInfo.localPath);
    
    try {
      if (fs.existsSync(localPath)) {
        const stats = fs.statSync(localPath);
        totalSize += stats.size;
      }
      
      oldestImage = Math.min(oldestImage, imageInfo.savedAt);
      newestImage = Math.max(newestImage, imageInfo.savedAt);
    } catch (error) {
      console.error(`Error getting stats for image ${key}:`, error);
    }
  }
  
  return {
    imageCount,
    totalSize,
    maxCacheSize: MAX_CACHE_SIZE,
    oldestImage: new Date(oldestImage).toISOString(),
    newestImage: new Date(newestImage).toISOString(),
    lastCleanup: new Date(manifest.lastCleanup).toISOString(),
    cacheRefreshInterval: `${CACHE_REFRESH_INTERVAL / (60 * 60 * 1000)} hours`
  };
}