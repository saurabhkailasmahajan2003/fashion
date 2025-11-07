import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import Product from './models/Product.js';
import fs from 'fs';
import path from 'path';
import url from 'url';

dotenv.config();

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Normalize URL similar to controller logic used for pruning
const normalizeUrl = (u) => {
  try {
    const parsed = new URL(u);
    parsed.hash = '';
    parsed.search = '';
    parsed.hostname = parsed.hostname.toLowerCase();
    // remove trailing slash from pathname
    if (parsed.pathname !== '/' && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    return parsed.toString();
  } catch {
    return (u || '').trim();
  }
};

const safeString = (s) => (s || '').toString().trim().toLowerCase();

const run = async () => {
  try {
    await connectDB();
    const argv = process.argv.slice(2);
    const doReset = argv.includes('--reset');
    const filePath = path.join(__dirname, 'data', 'seedProducts.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const incoming = JSON.parse(raw);

    if (doReset) {
      await Product.deleteMany({});
    }

    // Load existing minimal fields for duplicate detection (may be empty after reset)
    const existing = await Product.find({}, { name: 1, brand: 1, image: 1, images: 1 }).lean();

    const existingNameBrand = new Set(
      existing.map((p) => `${safeString(p.name)}|${safeString(p.brand)}`)
    );

    const existingImageSet = new Set();
    for (const p of existing) {
      if (p.image) existingImageSet.add(normalizeUrl(p.image));
      if (Array.isArray(p.images)) {
        for (const im of p.images) existingImageSet.add(normalizeUrl(im));
      }
    }

    const toInsert = [];
    for (const prod of incoming) {
      const nameBrandKey = `${safeString(prod.name)}|${safeString(prod.brand)}`;

      // Ensure images array exists and primary image is set
      const images = Array.isArray(prod.images) ? prod.images.filter(Boolean) : [];
      let image = prod.image || images[0] || '';

      const normalizedImages = [image, ...images].filter(Boolean).map(normalizeUrl);

      const imageClash = normalizedImages.some((ni) => existingImageSet.has(ni));
      const nameBrandClash = existingNameBrand.has(nameBrandKey);

      if (imageClash || nameBrandClash) {
        continue; // skip duplicates
      }

      toInsert.push({
        name: prod.name,
        brand: prod.brand || 'Generic',
        image,
        images,
        description: prod.description || '',
        category: prod.category,
        subCategory: prod.subCategory,
        price: prod.price,
        color: prod.color,
        sizes: Array.isArray(prod.sizes) ? prod.sizes : [],
        rating: typeof prod.rating === 'number' ? prod.rating : 0,
        reviews: typeof prod.reviews === 'number' ? prod.reviews : 0,
        stock: typeof prod.stock === 'number' ? prod.stock : 0,
        discount: typeof prod.discount === 'number' ? prod.discount : 0,
        newArrival: Boolean(prod.newArrival),
        onSale: Boolean(prod.onSale)
      });
    }

    let inserted = 0;
    if (toInsert.length > 0) {
      const res = await Product.insertMany(toInsert);
      inserted = res.length;
    }

    // eslint-disable-next-line no-console
    console.log(
      `Seeding complete${doReset ? ' (reset mode)' : ''}. Incoming: ${incoming.length}. Skipped (duplicates): ${incoming.length - toInsert.length}. Inserted: ${inserted}.`
    );
    process.exit(0);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Seeding failed:', e);
    process.exit(1);
  }
};

run();

