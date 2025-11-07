// seed-images.js
// Build unique Unsplash (or Picsum) URLs from product fields and optionally apply to DB.
// Usage:
//   node seed-images.js           # preview (prints first 10)
//   node seed-images.js apply     # write to DB using Unsplash Source URLs
//   node seed-images.js apply picsum  # write to DB using Picsum deterministic URLs

import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import Product from './models/Product.js';

dotenv.config();

function buildQuery(product) {
  const parts = [];
  if (product.color) parts.push(product.color);
  if (product.material) parts.push(product.material);
  if (product.subCategory) parts.push(String(product.subCategory).replace(/\s+/g, '-'));
  if (product.category) parts.push(product.category);
  if (product.style) parts.push(product.style);
  if (product.target) parts.push(product.target);
  if (!parts.length) parts.push('fashion', 'product');
  return parts.map((p) => encodeURIComponent(String(p).toLowerCase())).join(',');
}

function unsplashImageUrl(product, index) {
  // 600x600 square images; &sig ensures per-product uniqueness
  const q = buildQuery(product);
  return `https://source.unsplash.com/600x600/?${q}&sig=${index}`;
}

function picsumImageUrl(product, index) {
  // deterministic seed so every run gives same unique image for same product
  const seedParts = `${product.subCategory || 'item'}-${product.brand || ''}-${product._id || product.id || index}-${index}`;
  return `https://picsum.photos/seed/${encodeURIComponent(seedParts)}/600/600`;
}

function buildPrompt(product) {
  const bg = (product.target && String(product.target).toLowerCase() === 'kids') ? 'pastel' : 'white';
  const color = product.color || 'neutral';
  const material = product.material || '';
  const sub = product.subCategory || 'product';
  const target = product.target || (String(product.category || '').toLowerCase().includes('men') ? 'men' : (String(product.category || '').toLowerCase().includes('women') ? 'women' : 'unisex'));
  const angles = ['front view on a hanger', 'side angle on a stand', 'top-down flat lay', 'three-quarter angle', 'close-up detail'];
  const angle = angles[(Math.abs((product._id?.toString() || '').length + (product.name || '').length)) % angles.length];
  return `Studio photo of a ${color} ${material} ${sub} for ${target} — ${angle}, on a plain ${bg} background, professional lighting, centered, high detail.`;
}

async function main() {
  const mode = (process.argv[2] || '').toLowerCase();
  const provider = (process.argv[3] || 'unsplash').toLowerCase(); // 'unsplash' | 'picsum'

  await connectDB();
  const products = await Product.find({}, { name: 1, brand: 1, category: 1, subCategory: 1, color: 1 }).lean();

  const records = products.map((p, i) => {
    const base = {
      productId: String(p._id),
      imagePrompt: buildPrompt(p)
    };
    const url = provider === 'picsum' ? picsumImageUrl(p, i + 1) : unsplashImageUrl(p, i + 1);
    return { ...base, imageUrl: url };
  });

  if (mode !== 'apply') {
    console.log(JSON.stringify(records.slice(0, 10), null, 2));
    console.log(`\nPreviewed ${Math.min(10, records.length)} of ${records.length} image records. Run 'node seed-images.js apply' to write to DB.`);
    process.exit(0);
  }

  let updated = 0;
  for (const r of records) {
    await Product.updateOne({ _id: r.productId }, { $set: { image: r.imageUrl, images: [r.imageUrl] } });
    updated += 1;
  }
  console.log(`✅ Applied ${updated} images to products using provider: ${provider}`);
  process.exit(0);
}

main().catch((e) => {
  console.error('seed-images failed:', e);
  process.exit(1);
});
