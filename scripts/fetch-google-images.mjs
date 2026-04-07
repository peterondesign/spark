#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { load } from 'cheerio';
import { chromium } from 'playwright';

dotenv.config();

const DEFAULT_CSV_PATH = '/Users/peteriyitor/Downloads/date_ideas_rows (2).csv';
const DEFAULT_OUTPUT_DIR = path.resolve(process.cwd(), 'public/google-images');
const DEFAULT_PUBLIC_PREFIX = '/google-images';
const DEFAULT_MODEL = 'gpt-4.1-mini';
const BLOCKED_HOST_FRAGMENTS = ['shutterstock.', 'gettyimages.', 'istockphoto.', 'alamy.', 'freepik.', 'pinterest.', 'facebook.', 'instagram.', 'tiktok.'];

function printHelp() {
  console.log(`
OpenAI web-search image fetcher for date-idea CSV rows.

Required environment variables:
  OPENAI_API_KEY                 OpenAI API key with web search access

Usage:
  node scripts/fetch-google-images.mjs [options]

Options:
  --csv <path>            CSV file to read and optionally update
  --output-dir <path>     Folder to save downloaded images
  --public-prefix <path>  Prefix written into the CSV image column
  --limit <number>        Process only the first N rows
  --offset <number>       Skip the first N rows
  --delay-ms <number>     Delay between search requests
  --model <name>          OpenAI model to use for web search
  --write-csv             Rewrite the CSV image column with local paths
  --overwrite             Replace files even if they already exist
  --dry-run               Search and show chosen URLs without downloading
  --help                  Show this help

Notes:
  - Uses OpenAI web search rather than scraping Google result pages directly.
  - The model can still surface weak or blocked image URLs, so review outputs.
`);
}

function parseArgs(argv) {
  const options = {
    csvPath: DEFAULT_CSV_PATH,
    outputDir: DEFAULT_OUTPUT_DIR,
    publicPrefix: DEFAULT_PUBLIC_PREFIX,
    limit: Number.MAX_SAFE_INTEGER,
    offset: 0,
    delayMs: 500,
    model: DEFAULT_MODEL,
    writeCsv: false,
    overwrite: false,
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--help') {
      options.help = true;
    } else if (arg === '--csv' && next) {
      options.csvPath = next;
      index += 1;
    } else if (arg === '--output-dir' && next) {
      options.outputDir = next;
      index += 1;
    } else if (arg === '--public-prefix' && next) {
      options.publicPrefix = next;
      index += 1;
    } else if (arg === '--limit' && next) {
      options.limit = Number(next);
      index += 1;
    } else if (arg === '--offset' && next) {
      options.offset = Number(next);
      index += 1;
    } else if (arg === '--delay-ms' && next) {
      options.delayMs = Number(next);
      index += 1;
    } else if (arg === '--model' && next) {
      options.model = next;
      index += 1;
    } else if (arg === '--write-csv') {
      options.writeCsv = true;
    } else if (arg === '--overwrite') {
      options.overwrite = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else {
      throw new Error(`Unknown or incomplete argument: ${arg}`);
    }
  }

  if (!Number.isFinite(options.limit) || options.limit < 0) {
    throw new Error('--limit must be a non-negative number');
  }

  if (!Number.isFinite(options.offset) || options.offset < 0) {
    throw new Error('--offset must be a non-negative number');
  }

  if (!Number.isFinite(options.delayMs) || options.delayMs < 0) {
    throw new Error('--delay-ms must be a non-negative number');
  }

  return options;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[+/]/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function parseCsv(text) {
  const rows = [];
  let currentCell = '';
  let currentRow = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        currentCell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        index += 1;
      }
      currentRow.push(currentCell);
      if (currentRow.length > 1 || currentRow[0] !== '') {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
      continue;
    }

    currentCell += char;
  }

  if (currentCell !== '' || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  const [header = [], ...dataRows] = rows;
  return dataRows.map((row) => {
    const entry = {};
    header.forEach((key, index) => {
      entry[key] = row[index] ?? '';
    });
    return entry;
  });
}

function escapeCsvValue(value) {
  const stringValue = String(value ?? '');
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function serializeCsv(rows) {
  if (rows.length === 0) {
    return '';
  }

  const header = Object.keys(rows[0]);
  const lines = [header.join(',')];

  for (const row of rows) {
    lines.push(header.map((key) => escapeCsvValue(row[key] ?? '')).join(','));
  }

  return `${lines.join('\n')}\n`;
}

function buildSearchQuery(row) {
  const title = row.title?.trim() || row.slug || 'date idea';
  const category = row.category?.trim() || '';
  const titleLower = title.toLowerCase();

  if (/(dinner|brunch|breakfast|cafe|restaurant|bar|brewery|wine|cocktail|sushi|hotpot|baking|cooking)/.test(titleLower)) {
    return `${title} date food photography`;
  }

  if (/(hike|cycling|jog|run|swim|kayak|surf|volleyball|archery|skating|scuba|yoga|pilates|martial arts|fishing)/.test(titleLower)) {
    return `${title} couple activity outdoors`;
  }

  if (/(concert|opera|orchestra|theater|gig|jazz|poetry|open mic|circus|cabaret|magic)/.test(titleLower)) {
    return `${title} live event audience photo`;
  }

  if (/(spa|massage|sauna|meditation|sound bath|float therapy|aromatherapy|breathwork)/.test(titleLower)) {
    return `${title} wellness spa photo`;
  }

  if (/(museum|gallery|bookstore|library|market|shop|ikea|planetarium|landmark|cultural center|art studio)/.test(titleLower)) {
    return `${title} date idea couple`;
  }

  return `${title} ${category} date idea couple`;
}

async function searchImageWithOpenAI(client, row, model, retryMode = false) {
  const query = buildSearchQuery(row);
  const title = row.title?.trim() || row.slug || 'date idea';
  const retryQuery = `${query} -site:shutterstock.com -site:gettyimages.com -site:istockphoto.com -site:alamy.com -site:freepik.com -site:pinterest.com -site:facebook.com -site:instagram.com`;
  const userPrompt = retryMode
    ? `The previous image candidate failed to download. Find a replacement for this date idea: ${title}. Search query: ${retryQuery}. Return a real, reachable sourcePageUrl copied from web search results. Avoid Shutterstock, Getty, iStock, Alamy, Freepik, Pinterest, Facebook, Instagram, and invented domains. If you are not confident in a direct downloadable image URL, set imageUrl to an empty string and rely on the sourcePageUrl. Return JSON with keys imageUrl, sourcePageUrl, and rationale.`
    : `Find the single best representative image source for this date idea: ${title}. Search query: ${query}. Return a real, reachable sourcePageUrl copied from web search results. If you know a direct downloadable image URL on that page, include it in imageUrl. If not, set imageUrl to an empty string. Return JSON with keys imageUrl, sourcePageUrl, and rationale. Do not invent domains or webpage URLs.`;

  const response = await client.responses.create({
    model,
    tools: [{ type: 'web_search_preview' }],
    input: [
      {
        role: 'system',
        content: [
          {
            type: 'input_text',
            text: 'You search the public web for representative images. Return exactly one direct image URL that best represents the requested date idea. Prefer stable JPG, JPEG, PNG, or WEBP image URLs from editorial, tourism, educational, or venue pages. Avoid logos, icons, illustrations, social profile images, watermarked stock previews, Pinterest pins, or generic unrelated collages.'
          }
        ]
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: userPrompt
          }
        ]
      }
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'image_result',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            imageUrl: { type: 'string' },
            sourcePageUrl: { type: 'string' },
            rationale: { type: 'string' }
          },
          required: ['imageUrl', 'sourcePageUrl', 'rationale']
        }
      }
    }
  });

  const payload = response.output_text || '{}';
  const parsed = parseModelJson(payload);
  if (!parsed.sourcePageUrl || typeof parsed.sourcePageUrl !== 'string') {
    throw new Error('OpenAI search did not return a usable source page URL');
  }

  return parsed;
}

function parseModelJson(payload) {
  try {
    return JSON.parse(payload);
  } catch {
    const fenced = payload.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    try {
      return JSON.parse(fenced);
    } catch {
      const start = fenced.indexOf('{');
      const end = fenced.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        return JSON.parse(fenced.slice(start, end + 1));
      }
      throw new Error('Could not parse JSON returned by OpenAI search');
    }
  }
}

function hasBlockedHost(candidateUrl) {
  const lower = candidateUrl.toLowerCase();
  return BLOCKED_HOST_FRAGMENTS.some((fragment) => lower.includes(fragment));
}

function isLikelyDirectImageUrl(candidateUrl) {
  const lower = candidateUrl.toLowerCase();
  if (!lower || hasBlockedHost(lower)) return false;
  if (/\.(jpe?g|png|webp|gif)(?:\?|$)/.test(lower)) return true;
  if (/images\.unsplash\.com|imagekit|cloudinary|cdn\.|\/media\/|\/images\/|_next\/image\?/.test(lower)) return true;
  return false;
}

function normalizeUrl(candidateUrl, baseUrl) {
  if (!candidateUrl) return '';
  try {
    return new URL(candidateUrl, baseUrl).toString();
  } catch {
    return '';
  }
}

function scoreCandidateUrl(candidateUrl, row, position) {
  const url = candidateUrl.toLowerCase();
  const title = (row.title || '').toLowerCase();
  const slug = (row.slug || '').toLowerCase();
  let score = Math.max(0, 100 - position * 2);

  if (/\.(jpe?g|png|webp)(?:\?|$)/.test(url)) score += 25;
  if (/og-image|hero|featured|cover|banner|uploads|media|content/.test(url)) score += 20;
  if (title && url.includes(title.replace(/[^a-z0-9]+/g, '-'))) score += 15;
  if (slug && url.includes(slug)) score += 15;

  if (/logo|icon|avatar|profile|sprite|thumb|thumbnail|placeholder|favicon|emoji/.test(url)) score -= 80;
  if (/pinterest|facebook|instagram|tiktok|gravatar/.test(url)) score -= 30;

  return score;
}

async function extractCandidateImagesFromPage(pageUrl, row) {
  if (!pageUrl) {
    return [];
  }

  const response = await fetch(pageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; DateIdeasImageFetcher/1.0)',
      'Accept': 'text/html,application/xhtml+xml',
    },
  });

  if (!response.ok) {
    throw new Error(`Source page fetch failed with ${response.status}`);
  }

  const html = await response.text();
  const $ = load(html);
  const candidates = [];

  const pushCandidate = (value) => {
    const normalized = normalizeUrl(value, pageUrl);
    if (normalized && !candidates.includes(normalized)) {
      candidates.push(normalized);
    }
  };

  $('meta[property="og:image"], meta[property="og:image:url"], meta[name="twitter:image"], meta[name="twitter:image:src"], meta[itemprop="image"]').each((_, element) => {
    pushCandidate($(element).attr('content'));
  });

  $('link[rel="image_src"]').each((_, element) => {
    pushCandidate($(element).attr('href'));
  });

  $('img').each((_, element) => {
    pushCandidate($(element).attr('src'));

    const srcset = $(element).attr('srcset') || '';
    srcset
      .split(',')
      .map((part) => part.trim().split(/\s+/)[0])
      .filter(Boolean)
      .forEach(pushCandidate);
  });

  return candidates
    .map((candidateUrl, position) => ({ candidateUrl, score: scoreCandidateUrl(candidateUrl, row, position) }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score)
    .map((candidate) => candidate.candidateUrl)
    .slice(0, 12);
}

function extensionFromContentType(contentType) {
  if (!contentType) return 'jpg';
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('webp')) return 'webp';
  if (contentType.includes('gif')) return 'gif';
  return 'jpg';
}

function extensionFromUrl(url) {
  const match = url.toLowerCase().match(/\.([a-z0-9]+)(?:\?|$)/);
  if (!match) return '';
  const ext = match[1];
  return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : '';
}

async function downloadImage(url, referer) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; DateIdeasImageFetcher/1.0)',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      ...(referer ? { Referer: referer } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Download failed with ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType && !contentType.startsWith('image/')) {
    throw new Error(`URL did not return an image content-type (${contentType})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const extension = extensionFromUrl(url) || extensionFromContentType(contentType);
  return { buffer, extension };
}

async function resolveDownloadableImage(best, row) {
  const attempts = [];

  if (best.sourcePageUrl && !hasBlockedHost(best.sourcePageUrl)) {
    try {
      const extracted = await extractCandidateImagesFromPage(best.sourcePageUrl, row);
      for (const candidateUrl of extracted) {
        if (!attempts.some((attempt) => attempt.url === candidateUrl)) {
          attempts.push({ url: candidateUrl, referer: best.sourcePageUrl });
        }
      }
    } catch (error) {
      // Keep the direct-image attempt result if source-page extraction fails.
    }
  }

  if (best.imageUrl && isLikelyDirectImageUrl(best.imageUrl)) {
    attempts.push({ url: best.imageUrl, referer: best.sourcePageUrl || undefined });
  }

  const errors = [];
  for (const attempt of attempts) {
    try {
      const downloaded = await downloadImage(attempt.url, attempt.referer);
      return { ...downloaded, resolvedUrl: attempt.url };
    } catch (error) {
      errors.push(`${attempt.url} -> ${error.message}`);
    }
  }

  if (best.sourcePageUrl && !hasBlockedHost(best.sourcePageUrl)) {
    try {
      const screenshot = await captureSourcePageScreenshot(best.sourcePageUrl);
      return { ...screenshot, resolvedUrl: `${best.sourcePageUrl} [screenshot]` };
    } catch (error) {
      errors.push(`${best.sourcePageUrl} [screenshot] -> ${error.message}`);
    }
  }

  throw new Error(errors[0] || 'No downloadable image candidate found');
}

async function captureSourcePageScreenshot(sourcePageUrl) {
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (compatible; DateIdeasImageFetcher/1.0)',
    });

    await page.goto(sourcePageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const buffer = await page.screenshot({ type: 'png', fullPage: false });
    return { buffer, extension: 'png' };
  } finally {
    await browser.close();
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY in environment');
  }

  const client = new OpenAI({ apiKey });
  const csvText = await fs.readFile(options.csvPath, 'utf8');
  const rows = parseCsv(csvText);
  const selectedRows = rows.slice(options.offset, options.offset + options.limit);

  await fs.mkdir(options.outputDir, { recursive: true });

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let index = 0; index < selectedRows.length; index += 1) {
    const row = selectedRows[index];
    const title = row.title || `Row ${index + options.offset + 1}`;
    const slug = row.slug || slugify(title);

    try {
      const best = await searchImageWithOpenAI(client, row, options.model);

      if (options.dryRun) {
        console.log(`• ${title} -> ${best.imageUrl} (${best.sourcePageUrl})`);
        await sleep(options.delayMs);
        continue;
      }

      let downloadable;
      try {
        downloadable = await resolveDownloadableImage(best, row);
      } catch (initialError) {
        const retryBest = await searchImageWithOpenAI(client, row, options.model, true);
        downloadable = await resolveDownloadableImage(retryBest, row);
      }

      const { extension, buffer, resolvedUrl } = downloadable;
      const fileName = `${slug}.${extension === 'jpeg' ? 'jpg' : extension}`;
      const filePath = path.join(options.outputDir, fileName);
      const publicPath = `${options.publicPrefix.replace(/\/$/, '')}/${fileName}`;

      if (!options.overwrite && await fileExists(filePath)) {
        skipped += 1;
        row.image = publicPath;
        console.log(`↷ Skipped existing file for ${title}`);
        await sleep(options.delayMs);
        continue;
      }

      await fs.writeFile(filePath, buffer);
      row.image = publicPath;
      downloaded += 1;
  console.log(`✓ ${title} -> ${publicPath} (${resolvedUrl})`);
    } catch (error) {
      failed += 1;
      console.log(`✗ ${title}: ${error.message}`);
    }

    await sleep(options.delayMs);
  }

  if (options.writeCsv && !options.dryRun) {
    await fs.writeFile(options.csvPath, serializeCsv(rows), 'utf8');
    console.log(`\nUpdated CSV image column in ${options.csvPath}`);
  }

  console.log(`\nDone. Downloaded: ${downloaded}, skipped: ${skipped}, failed: ${failed}`);
}

main().catch((error) => {
  console.error(`\nError: ${error.message}`);
  process.exit(1);
});
