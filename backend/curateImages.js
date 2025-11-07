import fs from 'fs';
import path from 'path';
import url from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!ACCESS_KEY) {
  console.error('Missing UNSPLASH_ACCESS_KEY in backend/.env');
  process.exit(1);
}

const PER_PRODUCT_IMAGES = 3;
const TARGET_WIDTH = 800;
const TARGET_HEIGHT = 1000;

const subcategoryQueries = {
  // Mens
  Shirts: ['men formal shirt studio', 'men shirt folded', 'oxford shirt men'],
  Jeans: ['men denim jeans flatlay', 'men jeans studio', 'denim stack'],
  Jackets: ['men jacket studio', 'men bomber jacket', 'men denim jacket'],
  Shoes: ['men sneakers studio', 'men running shoes product', 'men loafers product'],
  Accessories: ['men belt leather', 'men wallet leather studio', 'watch product studio', 'sunglasses product studio'],
  // Womens
  Dresses: ['women dress studio', 'midi dress product', 'wrap dress studio'],
  Tops: ['women blouse studio', 'women top product', 'silk blouse studio'],
  Skirts: ['women skirt studio', 'pleated skirt product', 'denim skirt studio'],
  Bags: ['women tote bag studio', 'crossbody bag product', 'handbag studio'],
  Jewelry: ['earrings jewelry studio', 'pendant necklace product', 'bracelet jewelry studio'],
  // Kids
  Boys: ['boys clothing flatlay', 'kids hoodie studio', 'kids sneakers product'],
  Girls: ['girls dress studio', 'kids flats product', 'girls skirt studio'],
  Baby: ['baby onesie flatlay', 'baby romper studio', 'baby booties product']
};

const searchUnsplash = async (query, page = 1, perPage = 30) => {
  const endpoint = new URL('https://api.unsplash.com/search/photos');
  endpoint.searchParams.set('query', query);
  endpoint.searchParams.set('page', String(page));
  endpoint.searchParams.set('per_page', String(perPage));
  endpoint.searchParams.set('orientation', 'portrait');
  const res = await fetch(endpoint.toString(), {
    headers: { Authorization: `Client-ID ${ACCESS_KEY}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Unsplash error ${res.status}: ${text}`);
  }
  return res.json();
};

const toImgUrl = (id) => `https://images.unsplash.com/photo-${id}?w=${TARGET_WIDTH}&h=${TARGET_HEIGHT}&fit=crop&crop=entropy&auto=format&q=80`;

const loadProducts = () => {
  const p = path.join(__dirname, 'data', 'seedProducts.json');
  const raw = fs.readFileSync(p, 'utf-8');
  return { p, data: JSON.parse(raw) };
};

const groupBySubcategory = (products) => {
  const map = new Map();
  products.forEach((prod, idx) => {
    const key = prod.subCategory;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push({ idx, prod });
  });
  return map;
};

const unique = (arr) => Array.from(new Set(arr));

const collectIdsForSubcategory = async (subCategory, needed) => {
  const queries = subcategoryQueries[subCategory] || [subCategory];
  const ids = new Set();
  let page = 1;
  let qIndex = 0;
  while (ids.size < needed && page <= 10 && qIndex < queries.length) {
    const q = queries[qIndex];
    const json = await searchUnsplash(q, page, 30);
    json.results.forEach((r) => {
      if (r && r.id) ids.add(r.id);
    });
    page += 1;
    if (page > 5) { // rotate to next query to diversify after 5 pages
      qIndex += 1;
      page = 1;
    }
  }
  return Array.from(ids);
};

const main = async () => {
  const { p, data } = loadProducts();
  const bySub = groupBySubcategory(data);
  const usedIds = new Set();

  for (const [subCategory, items] of bySub.entries()) {
    const need = items.length * PER_PRODUCT_IMAGES;
    console.log(`Curating images for ${subCategory}: need ${need}`);
    const poolIds = await collectIdsForSubcategory(subCategory, need + 50); // buffer
    if (poolIds.length < need) {
      console.warn(`Warning: only ${poolIds.length} images found for ${subCategory}, some reuse may occur.`);
    }

    let cursor = 0;
    items.forEach(({ idx }) => {
      const imgs = [];
      for (let k = 0; k < PER_PRODUCT_IMAGES; k++) {
        // Find next unused id
        let attempts = 0;
        while (attempts < poolIds.length && usedIds.has(poolIds[cursor % poolIds.length])) {
          cursor += 1;
          attempts += 1;
        }
        const id = poolIds[cursor % poolIds.length];
        cursor += 1;
        if (id) {
          usedIds.add(id);
          imgs.push(toImgUrl(id));
        }
      }
      if (imgs.length > 0) {
        data[idx].images = imgs;
        data[idx].image = imgs[0];
      }
    });
  }

  fs.writeFileSync(p, JSON.stringify(data, null, 2));
  console.log('✅ Updated seedProducts.json with curated Unsplash images for each product.');
};

main().catch((e) => {
  console.error('Curate failed:', e);
  process.exit(1);
});
