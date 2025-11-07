import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { connectDB } from './config/db.js';
import Product from './models/Product.js';

dotenv.config();

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
  await connectDB();
  const file = path.join(__dirname, 'data', 'imageRecords.json');
  if (!fs.existsSync(file)) {
    console.error('Missing data/imageRecords.json. Run: node generateImageRecords.js');
    process.exit(1);
  }
  const records = JSON.parse(fs.readFileSync(file, 'utf-8'));

  let updated = 0;
  for (const r of records) {
    if (!r.productId || !r.imageUrl) continue;
    await Product.updateOne(
      { _id: r.productId },
      { $set: { image: r.imageUrl, images: [r.imageUrl] } }
    );
    updated += 1;
  }

  console.log(`✅ Applied images to ${updated} products from imageRecords.json`);
  process.exit(0);
};

run().catch((e) => {
  console.error('applyImageRecords failed:', e);
  process.exit(1);
});
