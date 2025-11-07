import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { connectDB } from './config/db.js';
import Product from './models/Product.js';

dotenv.config();

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const slug = (s) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
const pick = (arr, idxSeed = 0) => arr[(Math.abs(idxSeed) % arr.length) || 0];

const angles = [
  'front view on a hanger',
  'side angle on a stand',
  'top-down flat lay',
  'three-quarter angle',
  'close-up detail shot'
];

const backgrounds = ['white', 'light gray', 'beige', 'off-white', 'pale blue'];

const inferTarget = (p) => {
  const cat = (p.category || '').toLowerCase();
  if (p.target) return p.target.toLowerCase();
  if (cat.includes('men')) return 'men';
  if (cat.includes('women')) return 'women';
  if (cat.includes('kid')) return 'kids';
  return 'unisex';
};

const materialFallback = (p) => p.material || (
  /shirt|top|dress|skirt|onesie/i.test(p.subCategory) ? 'cotton'
  : /jean|denim/i.test(p.subCategory) ? 'denim'
  : /jacket/i.test(p.subCategory) ? 'polyester'
  : /shoe|sneaker/i.test(p.subCategory) ? 'mesh'
  : /bag|wallet/i.test(p.subCategory) ? 'leather'
  : /jewel|necklace|earring|bracelet|ring/i.test(p.subCategory) ? 'metal'
  : 'fabric'
);

const colorFallback = (p) => (p.color || (/jean|denim/i.test(p.subCategory) ? 'indigo' : 'black')).toLowerCase();

const sigFrom = (p) => {
  const base = [
    p._id || Math.random().toString(36).slice(2),
    p.category, p.subCategory, p.brand, p.name, p.color, p.material
  ].map((x) => x || '').join('|');
  let h = 0;
  for (let i = 0; i < base.length; i++) h = (h * 31 + base.charCodeAt(i)) >>> 0;
  return h;
};

const buildPrompt = (p, idx = 0) => {
  const target = inferTarget(p);
  const color = colorFallback(p);
  const material = materialFallback(p);
  const angle = pick(angles, idx + sigFrom(p));
  const bg = pick(backgrounds, idx + sigFrom(p) * 7);
  return `Studio photo of a ${color} ${material} ${p.subCategory} for ${target} — ${angle}, on a plain ${bg} background, professional lighting, centered, high detail.`;
};

const buildUnsplashQuery = (p) => {
  const target = inferTarget(p);
  const color = colorFallback(p);
  const material = materialFallback(p);
  const parts = [
    `${color} ${material} ${p.subCategory} ${target}`,
    'studio', 'plain background', 'product', 'isolated'
  ];
  return parts.join(', ');
};

const buildRecord = (p) => {
  const sig = sigFrom(p);
  const query = buildUnsplashQuery(p);
  const prompt = buildPrompt(p);
  // Unsplash Source with deterministic signature for uniqueness
  const imageUrl = `https://source.unsplash.com/800x1000/?${encodeURIComponent(query)}&sig=${sig}`;
  return {
    productId: String(p._id || ''),
    imagePrompt: prompt,
    imageUrl
  };
};

const run = async () => {
  await connectDB();
  const products = await Product.find({}, { name: 1, brand: 1, category: 1, subCategory: 1, color: 1 }).lean();
  const records = products.map(buildRecord);
  const outDir = path.join(__dirname, 'data');
  const outPath = path.join(outDir, 'imageRecords.json');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(records, null, 2));
  console.log(`✅ Wrote ${records.length} image records to ${outPath}`);
  process.exit(0);
};

run().catch((e) => {
  console.error('generateImageRecords failed:', e);
  process.exit(1);
});
