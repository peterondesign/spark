import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import * as https from 'https';
import { NextRequest, NextResponse } from 'next/server';

const IMAGE_CACHE_DIR = path.join(process.cwd(), 'public/image-cache');
const CACHE_MANIFEST_PATH = path.join(IMAGE_CACHE_DIR, 'manifest.json');
const MAX_CACHE_SIZE = 1000; // Maximum number of images to cache
const CACHE_CLEANUP_FREQUENCY = 7 * 24 * 60 * 60 * 1000; // 7 days

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

// Download and save an image to the local cache
export async function cacheImage(imageUrl: string): Promise<string | null> {
  const manifest = getCacheManifest();
  const imageKey = getImageKey(imageUrl);
  
  // Check if the image is already cached
  if (manifest.images[imageKey]) {
    const imageInfo = manifest.images[imageKey];
    
    // Update last accessed time and count
    imageInfo.lastAccessed = Date.now();
    imageInfo.accessCount += 1;
    
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

// Get a cached image or fetch and cache if it doesn't exist
export async function getOrCacheImage(imageUrl: string): Promise<string> {
  const cachedPath = await cacheImage(imageUrl);
  return cachedPath || imageUrl; // Fall back to original URL if caching fails
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
    
    // Read file
    const imageBuffer = fs.readFileSync(localPath);
    const contentType = getContentTypeFromExtension(path.extname(localPath));
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 year cache
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
  
  // Sort by last accessed time (oldest first)
  imageEntries.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
  
  // Calculate how many to remove
  const imagesToRemove = imageEntries.length - MAX_CACHE_SIZE;
  
  // Remove oldest images
  for (let i = 0; i < imagesToRemove; i++) {
    const [key, imageInfo] = imageEntries[i];
    const localPath = path.join(IMAGE_CACHE_DIR, imageInfo.localPath);
    
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
    lastCleanup: new Date(manifest.lastCleanup).toISOString()
  };
}