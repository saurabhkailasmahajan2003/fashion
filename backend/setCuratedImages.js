import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import Product from './models/Product.js';

dotenv.config();

// Build direct Unsplash URLs from stable photo IDs (no API key required)
const u = (id) => `https://images.unsplash.com/photo-${id}?w=800&h=1000&fit=crop&crop=entropy&auto=format&q=80`;

// Curated pools per subCategory (covering your taxonomy)
const curated = {
  // Mens
  Shirts: [
    u('1490481651871-ab68de25d43d'),
    u('1506634572416-48cdfe530110'),
    u('1503341455253-b2e723bb3dbb'),
    u('1503342217505-b0a15cf70489'),
    u('1512436991641-6745cdb1723f')
  ],
  Jeans: [
    u('1519741497674-611481863552'),
    u('1520972106213-8b456906c813'),
    u('1534452203293-494d7ddbf7e0'),
    u('1536520002442-39764a41e23c'),
    u('1541099649105-f69ad21f3246')
  ],
  Jackets: [
    u('1483721310020-03333e577078'),
    u('1507838153414-b4b713384a76'),
    u('1512436994602-128f5b2f2a0b'),
    u('1519744792095-2f2205e87b6f'),
    u('1475180098004-ca77a66827be')
  ],
  Shoes: [
    u('1542291026-7eec264c27ff'),
    u('1526045612212-70caf35c14df'),
    u('1520974735194-61a088d3c91b'),
    u('1543508282-6319a3e2621f'),
    u('1543508281-8fe77a2f72a8')
  ],
  Accessories: [
    u('1511381939415-c1c76e7558d5'),
    u('1522312346375-d1a52e2b99b3'),
    u('1518544801970-5f7f1b201f4b'),
    u('1520977407044-3d0d1d477f83')
  ],

  // Womens
  Dresses: [
    u('1595777457583-95e059d581b8'),
    u('1572804013309-59a88b7e92f1'),
    u('1551803091-e20673f15770'),
    u('1514996937319-344454492b37'),
    u('1516822003754-cca485356ecb')
  ],
  Tops: [
    u('1564257631407-4deb1f99d992'),
    u('1618244972599-11d777b2357e'),
    u('1583744946564-b52ac1c389c8'),
    u('1516594798947-e65505dbb29d')
  ],
  Skirts: [
    u('1542219550-87b7f34d08f8'),
    u('1541094458790-59c6d7d2f24f'),
    u('1533560904424-d0c9e1f0b7a0')
  ],
  Bags: [
    u('1541532713592-79a0317b6b77'),
    u('1545239351-1141bd82e8a6'),
    u('1547674823-5cd4a8b4b7b8'),
    u('1544025162-d76694265947')
  ],
  Jewelry: [
    u('1522312346375-d1a52e2b99b3'),
    u('1518544801970-5f7f1b201f4b'),
    u('1511381939415-c1c76e7558d5')
  ],

  // Kids
  Boys: [
    u('1622290291468-a28f7a7dc6a8'),
    u('1519238263530-99bdd11df2ea'),
    u('1519278409-1f56fdda7fe5'),
    u('1514989940723-e8e51635b782')
  ],
  Girls: [
    u('1591369822096-ffd140ec948f'),
    u('1592301933927-35b597393c0a'),
    u('1519741497674-611481863552')
  ],
  Baby: [
    u('1519681393784-d120267933ba'),
    u('1522335789203-aabd1fc54bc9'),
    u('1519682577862-22b62b24e493')
  ]
};

const fallbackPool = [
  u('1542291026-7eec264c27ff'),
  u('1512436991641-6745cdb1723f'),
  u('1506634572416-48cdfe530110')
];

const pickFromPool = (pool, index) => pool[index % pool.length];

async function run() {
  await connectDB();
  const products = await Product.find({}, { subCategory: 1, category: 1 }).lean();
  let updated = 0;
  let i = 0;
  for (const p of products) {
    const pool = curated[p.subCategory] || curated[p.category] || fallbackPool;
    const image = pickFromPool(pool, i++);
    await Product.updateOne({ _id: p._id }, { $set: { image, images: [image] } });
    updated += 1;
  }
  console.log(`✅ Applied curated direct Unsplash images to ${updated} products (deterministic, no API key).`);
  process.exit(0);
}

run().catch((e) => {
  console.error('setCuratedImages failed:', e);
  process.exit(1);
});
