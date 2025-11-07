// curatePerProductImages.js
// Per-product curated images that match the product title/attributes using Unsplash Search API.
// Requirements:
//   - Set UNSPLASH_ACCESS_KEY in your .env
// Usage:
//   node curatePerProductImages.js                 # dry run: prints first 10 mappings
//   node curatePerProductImages.js apply           # writes image+images to DB
//   node curatePerProductImages.js apply --limit 500   # process first 500 products
// Notes:
//   - Ensures uniqueness of Unsplash photo IDs across processed products.
//   - Falls back to deterministic Picsum if no search results or on API error/quota.

import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import Product from './models/Product.js';

dotenv.config();

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';
const UNSPLASH_API = 'https://api.unsplash.com/search/photos';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function buildSearchQuery(p) {
  const parts = [];
  if (p.name) parts.push(p.name);
  if (p.brand) parts.push(p.brand);
  if (p.subCategory) parts.push(p.subCategory);
  if (p.category) parts.push(p.category);
  if (p.color) parts.push(p.color);
  if (p.material) parts.push(p.material);
  if (p.target) parts.push(p.target);
  // Add product keyword to bias results
  parts.push('studio product white background');
  return parts.filter(Boolean).join(' ');
}

function directUnsplashUrl(photoId) {
  // Build a deterministic, cropped portrait URL (4:5) similar to the frontend aspect
  return `https://images.unsplash.com/photo-${photoId}?w=800&h=1000&fit=crop&crop=entropy&auto=format&q=80`;
}

function picsumFallback(p) {
  const seed = `${p._id}-${p.subCategory || 'item'}-${p.brand || ''}`;
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/1000`;
}

async function searchUnsplash(query, page = 1) {
  if (!ACCESS_KEY) return { results: [] };
  const url = new URL(UNSPLASH_API);
  url.searchParams.set('query', query);
  url.searchParams.set('orientation', 'portrait');
  url.searchParams.set('per_page', '10');
  url.searchParams.set('page', String(page));

  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
  });
  if (!res.ok) {
    return { results: [] };
  }
  const data = await res.json();
  return data || { results: [] };
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args[0] === 'apply';
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx !== -1 ? Number(args[limitIdx + 1]) : 0;

  await connectDB();

  const projection = { name: 1, brand: 1, category: 1, subCategory: 1, color: 1, material: 1, target: 1 };
  const query = {};
  let cursor = Product.find(query, projection).lean();
  if (limit > 0) cursor = cursor.limit(limit);
  const products = await cursor;

  const usedPhotoIds = new Set();
  const mappings = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const q = buildSearchQuery(p);
    let imageUrl = '';
    let photoId = '';

    try {
      const data = await searchUnsplash(q);
      const choice = (data.results || []).find(r => r && r.id && !usedPhotoIds.has(r.id));
      if (choice) {
        photoId = choice.id;
        usedPhotoIds.add(photoId);
        imageUrl = directUnsplashUrl(photoId);
      } else {
        imageUrl = picsumFallback(p);
      }
    } catch (e) {
      imageUrl = picsumFallback(p);
    }

    mappings.push({ productId: String(p._id), imageUrl, query: q });

    // Gentle rate limit to avoid 429
    await sleep(180);
  }

  if (!apply) {
    console.log(JSON.stringify(mappings.slice(0, 10), null, 2));
    console.log(`\nPreviewed ${Math.min(10, mappings.length)} of ${mappings.length}. Run 'node curatePerProductImages.js apply' to write to DB.`);
    process.exit(0);
  }

  let updated = 0;
  for (const m of mappings) {
    await Product.updateOne({ _id: m.productId }, { $set: { image: m.imageUrl, images: [m.imageUrl] } });
    updated += 1;
  }

  console.log(`✅ Applied curated per-product images to ${updated} products. Provider: ${ACCESS_KEY ? 'Unsplash+fallback' : 'Picsum only (no API key)'}`);
  process.exit(0);
}

main().catch((e) => {
  console.error('curatePerProductImages failed:', e);
  process.exit(1);
});
