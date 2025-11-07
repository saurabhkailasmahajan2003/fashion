import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import Product from './models/Product.js';

dotenv.config();

const slug = (s) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
const seedFrom = (p) => `${slug(p.category)}-${slug(p.subCategory)}-${slug(p.brand)}-${slug(p.name)}-${p._id}`;
const picsumUrl = (seed) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/1000`;

const promptFor = (p) => {
  const cat = (p.category || '').toLowerCase();
  const sub = (p.subCategory || '').toLowerCase();
  const brand = p.brand || 'Generic';
  const item = p.name || 'Product';

  const map = {
    mens: {
      shirts: `High-resolution studio photo of a men’s formal shirt (${brand} ${item}), front view, white background, professional softbox lighting.`,
      jeans: `High-resolution studio photo of men’s denim jeans (${brand} ${item}) folded, close-up texture, light gray background, even lighting.`,
      jackets: `High-resolution studio photo of a men’s jacket (${brand} ${item}) on a hanger, front view, white background, diffused lighting.`,
      shoes: `Studio image of men’s shoes (${brand} ${item}), side angle, floating shadow, matte white background, modern lighting.`,
      accessories: `Close-up studio photo of a men’s accessory (${brand} ${item}), three-quarter angle, neutral beige background, controlled highlights.`
    },
    womens: {
      dresses: `High-resolution studio photo of a women’s dress (${brand} ${item}) on a mannequin, front view, seamless white background, soft lighting.`,
      tops: `Studio image of a women’s blouse/top (${brand} ${item}) neatly arranged, flat-lay, light cream background, soft daylight.`,
      skirts: `High-resolution studio photo of a women’s skirt (${brand} ${item}), front view, white background, gentle falloff lighting.`,
      bags: `Close-up studio photo of a women’s handbag (${brand} ${item}), upright, beige background, soft gradient lighting.`,
      jewelry: `Macro studio photo of a women’s jewelry piece (${brand} ${item}) on a minimal stand, light gray background, subtle reflections.`
    },
    kids: {
      boys: `High-resolution studio photo of a boys’ apparel (${brand} ${item}) folded, front graphics visible, white background, soft skylight.`,
      girls: `Studio image of a girls’ apparel (${brand} ${item}) on a hanger, front view, pastel background, soft glam lighting.`,
      baby: `High-resolution studio photo of a baby onesie/romper (${brand} ${item}) laid flat, top-down angle, pastel background, diffused light.`
    }
  };

  const catMap = map[cat];
  if (catMap) {
    const val = catMap[sub];
    if (val) return val;
  }
  return `High-resolution studio photo of ${brand} ${item}, plain background, professional lighting.`;
};

const run = async () => {
  await connectDB();
  const cursor = Product.find({}, { name: 1, brand: 1, category: 1, subCategory: 1 }).lean().cursor();
  let total = 0;
  let updated = 0;

  for await (const p of cursor) {
    total += 1;
    const seed = seedFrom(p);
    const img = picsumUrl(seed);
    // Update only if missing or forced; here we set for all to ensure single, deterministic image
    await Product.updateOne({ _id: p._id }, { $set: { image: img, images: [img] } });
    updated += 1;
  }

  console.log(`Assigned single unique image to ${updated}/${total} products.`);
  process.exit(0);
};

run().catch((e) => {
  console.error('assignSingleImage failed:', e);
  process.exit(1);
});
