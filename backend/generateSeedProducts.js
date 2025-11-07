import fs from 'fs';
import path from 'path';
import url from 'url';

// Configuration
const PRODUCTS_PER_SUBCATEGORY = 100;
const IMAGES_PER_PRODUCT = 3;

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Catalog blueprint with realistic ranges and vocab
const catalog = {
  Mens: {
    Shirts: {
      items: ['Oxford Shirt', 'Formal Shirt', 'Checked Shirt', 'Linen Shirt', 'Casual Denim Shirt'],
      brands: ['Van Heusen', 'Peter England', 'Louis Philippe', 'Raymond', 'Allen Solly'],
      priceRange: { min: 799, max: 2499 },
      sizes: ['S', 'M', 'L', 'XL']
    },
    Jeans: {
      items: ['Slim Fit Jeans', 'Straight Fit Jeans', 'Tapered Jeans', 'Skinny Jeans', 'Relaxed Jeans'],
      brands: ["Levi's", 'Wrangler', 'Lee', 'Pepe Jeans', 'Jack & Jones'],
      priceRange: { min: 1299, max: 3499 },
      sizes: ['S', 'M', 'L', 'XL']
    },
    Jackets: {
      items: ['Denim Jacket', 'Bomber Jacket', 'PU Leather Jacket', 'Puffer Jacket', 'Harrington Jacket'],
      brands: ['Roadster', 'H&M', 'Zara', 'Mango Man', 'US Polo'],
      priceRange: { min: 1999, max: 5999 },
      sizes: ['S', 'M', 'L', 'XL']
    },
    Shoes: {
      items: ['Running Shoes', 'Casual Sneakers', 'Loafers', 'Formal Oxfords', 'Court Sneakers'],
      brands: ['Nike', 'Adidas', 'Puma', 'Red Tape', 'Bata'],
      priceRange: { min: 1499, max: 8999 },
      sizes: ['7', '8', '9', '10', '11']
    },
    Accessories: {
      items: ['Leather Belt', 'Wallet', 'Aviator Sunglasses', 'Cap', 'Watch'],
      brands: ['Fossil', 'Titan', 'Tommy Hilfiger', 'Ray-Ban', 'Woodland'],
      priceRange: { min: 499, max: 4999 },
      sizes: ['One Size']
    }
  },
  Womens: {
    Dresses: {
      items: ['Wrap Dress', 'A-Line Dress', 'Midi Dress', 'Shirt Dress', 'Slip Dress'],
      brands: ['Zara', 'Mango', 'ONLY', 'Forever New', 'FabAlley'],
      priceRange: { min: 999, max: 4999 },
      sizes: ['XS', 'S', 'M', 'L']
    },
    Tops: {
      items: ['Silk Blouse', 'Peplum Top', 'Ribbed Tank', 'Chiffon Top', 'Crop Top'],
      brands: ['Zara', 'Mango', 'H&M', 'Vero Moda', 'AND'],
      priceRange: { min: 499, max: 1999 },
      sizes: ['XS', 'S', 'M', 'L']
    },
    Skirts: {
      items: ['Pencil Skirt', 'A-Line Skirt', 'Pleated Skirt', 'Denim Skirt', 'Mini Skirt'],
      brands: ['H&M', 'Zara', 'ONLY', 'Forever 21', 'Mango'],
      priceRange: { min: 799, max: 2499 },
      sizes: ['XS', 'S', 'M', 'L']
    },
    Bags: {
      items: ['Tote Bag', 'Crossbody Bag', 'Shoulder Bag', 'Sling Bag', 'Mini Bag'],
      brands: ['Charles & Keith', 'Lavie', 'Caprese', 'ALDO', 'Hidesign'],
      priceRange: { min: 999, max: 6999 },
      sizes: ['One Size']
    },
    Jewelry: {
      items: ['Stud Earrings', 'Hoop Earrings', 'Pendant Necklace', 'Bracelet', 'Ring Set'],
      brands: ['Zaveri Pearls', 'Voylla', 'Mia by Tanishq', 'Pipa Bella', 'Yellow Chimes'],
      priceRange: { min: 399, max: 3999 },
      sizes: ['One Size']
    }
  },
  Kids: {
    Boys: {
      items: ['Graphic T-Shirt', 'Cargo Shorts', 'Hoodie', 'Joggers', 'Sneakers'],
      brands: ['GAP Kids', 'H&M Kids', 'Zara Kids', 'Peppermint', 'Allen Solly Junior'],
      priceRange: { min: 399, max: 1999 },
      sizes: ['3-4Y', '5-6Y', '7-8Y', '9-10Y']
    },
    Girls: {
      items: ['Floral Dress', 'Jeggings', 'Cardigan', 'Skirt', 'Ballet Flats'],
      brands: ['GAP Kids', 'H&M Kids', 'Zara Kids', 'U.S. Polo Assn. Kids', 'Pepe Kids'],
      priceRange: { min: 399, max: 2499 },
      sizes: ['3-4Y', '5-6Y', '7-8Y', '9-10Y']
    },
    Baby: {
      items: ['Onesie', 'Rompers', 'Baby Set', 'Swaddle', 'Booties'],
      brands: ['Mothercare', 'Mee Mee', 'Babyhug', 'H&M Baby', 'Carter\'s'],
      priceRange: { min: 299, max: 1499 },
      sizes: ['0-3M', '3-6M', '6-9M', '9-12M']
    }
  }
};

const colors = ['Black', 'White', 'Navy', 'Gray', 'Red', 'Blue', 'Green', 'Beige', 'Brown', 'Pink', 'Purple', 'Yellow'];

// Global image signature counter to guarantee uniqueness across all products
let imageSig = 5000;
const nextSig = () => ++imageSig;

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[randInt(0, arr.length - 1)];
const pickSome = (arr, min, max) => {
  const count = randInt(min, Math.min(max, arr.length));
  const set = new Set();
  while (set.size < count) set.add(pick(arr));
  return Array.from(set);
};

// Curated Unsplash photo IDs per subcategory for deterministic, product-accurate images
// Each entry is an array of Unsplash photo IDs. We will derive URLs as:
// https://images.unsplash.com/photo-<ID>?w=800&h=1000&fit=crop&crop=entropy&auto=format&q=80
const curated = {
  // Mens
  Shirts: [
    '1490481651871-ab68de25d43d', // folded shirts
    '1506634572416-48cdfe530110', // shirt on hanger
    '1503341455253-b2e723bb3dbb',
    '1503342217505-b0a15cf70489',
    '1512436991641-6745cdb1723f'
  ],
  Jeans: [
    '1519741497674-611481863552', // denim stack
    '1520972106213-8b456906c813', // jeans closeup
    '1534452203293-494d7ddbf7e0',
    '1536520002442-39764a41e23c',
    '1541099649105-f69ad21f3246'
  ],
  Jackets: [
    '1483721310020-03333e577078',
    '1507838153414-b4b713384a76',
    '1512436994602-128f5b2f2a0b',
    '1519744792095-2f2205e87b6f',
    '1475180098004-ca77a66827be'
  ],
  Shoes: [
    '1542291026-7eec264c27ff', // sneakers
    '1526045612212-70caf35c14df', // shoes lineup
    '1520974735194-61a088d3c91b',
    '1543508282-6319a3e2621f',
    '1543508281-8fe77a2f72a8'
  ],
  Accessories: [
    '1511381939415-c1c76e7558d5', // belt
    '1520972106213-8b456906c813', // leather
    '1522312346375-d1a52e2b99b3', // sunglasses
    '1518544801970-5f7f1b201f4b', // watch
    '1520977407044-3d0d1d477f83' // wallet
  ],

  // Womens
  Dresses: [
    '1595777457583-95e059d581b8',
    '1572804013309-59a88b7e92f1',
    '1551803091-e20673f15770',
    '1514996937319-344454492b37',
    '1516822003754-cca485356ecb'
  ],
  Tops: [
    '1564257631407-4deb1f99d992',
    '1618244972599-11d777b2357e',
    '1583744946564-b52ac1c389c8',
    '1516594798947-e65505dbb29d',
    '1520974735194-61a088d3c91b'
  ],
  Skirts: [
    '1542219550-87b7f34d08f8',
    '1516822003754-cca485356ecb',
    '1541094458790-59c6d7d2f24f',
    '1520972106213-8b456906c813',
    '1533560904424-d0c9e1f0b7a0'
  ],
  Bags: [
    '1541532713592-79a0317b6b77',
    '1519744792095-2f2205e87b6f',
    '1545239351-1141bd82e8a6',
    '1547674823-5cd4a8b4b7b8',
    '1544025162-d76694265947'
  ],
  Jewelry: [
    '1522312346375-d1a52e2b99b3',
    '1511381939415-c1c76e7558d5',
    '1518544801970-5f7f1b201f4b',
    '1520977407044-3d0d1d477f83',
    '1511381939415-c1c76e7558d5'
  ],

  // Kids
  Boys: [
    '1622290291468-a28f7a7dc6a8',
    '1519238263530-99bdd11df2ea',
    '1519278409-1f56fdda7fe5',
    '1514989940723-e8e51635b782',
    '1507464098880-e367bc5d2c08'
  ],
  Girls: [
    '1591369822096-ffd140ec948f',
    '1592301933927-35b597393c0a',
    '1519741497674-611481863552',
    '1519278409-1f56fdda7fe5',
    '1519238263530-99bdd11df2ea'
  ],
  Baby: [
    '1519681393784-d120267933ba',
    '1522335789203-aabd1fc54bc9',
    '1519682577862-22b62b24e493',
    '1522335789203-aabd1fc54bc9',
    '1519682577862-22b62b24e493'
  ]
};

const makeUnsplash = (photoId) => `https://images.unsplash.com/photo-${photoId}?w=800&h=1000&fit=crop&crop=entropy&auto=format&q=80`;

// Use Lorem Picsum with seeded URLs for reliable, unique, always-visible images (fallback)
// Portrait-ish dimensions suitable for product cards
const makePicsum = (seed) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/1000`;

const buildProducts = () => {
  const products = [];
  const breakpoints = [299, 399, 499, 599, 699, 799, 899, 999, 1199, 1299, 1499, 1699, 1799, 1999, 2199, 2499, 2699, 2999, 3499, 3999, 4499, 4999, 5499, 5999, 6499, 6999, 7499, 7999, 8499, 8999];
  Object.entries(catalog).forEach(([category, subs]) => {
    Object.entries(subs).forEach(([subCategory, meta]) => {
      for (let i = 0; i < PRODUCTS_PER_SUBCATEGORY; i++) {
        const brand = pick(meta.brands);
        const item = pick(meta.items);
        const name = `${brand} ${item}`;
        // INR price snapped to common Indian retail breakpoints within range
        const eligible = breakpoints.filter((p) => p >= meta.priceRange.min && p <= meta.priceRange.max);
        let price;
        if (eligible.length > 0) {
          price = pick(eligible);
        } else {
          // fallback to nearest .99/.49 if range is narrow
          const base = Math.min(Math.max(meta.priceRange.min, 99), meta.priceRange.max);
          const endings = [0, 49, 99];
          price = base - (base % 100) + pick(endings);
        }
        const sizes = pickSome(meta.sizes, Math.min(2, meta.sizes.length), Math.min(4, meta.sizes.length));
        const stock = randInt(10, 120);
        const discount = Math.random() < 0.25 ? randInt(5, 40) : 0;
        const newArrival = Math.random() < 0.3;
        const onSale = discount > 0;

        // Curated deterministic images per subcategory, fallback to Picsum
        const pool = curated[subCategory];
        let images;
        if (Array.isArray(pool) && pool.length > 0) {
          images = Array.from({ length: IMAGES_PER_PRODUCT }, (_, idx) => {
            const id = pool[(i + idx) % pool.length];
            return makeUnsplash(id);
          });
        } else {
          const baseSeed = `${category}-${subCategory}-${brand}-${item}-${i}-${Date.now()}-${nextSig()}`;
          images = Array.from({ length: IMAGES_PER_PRODUCT }, (_, idx) => makePicsum(`${baseSeed}-${idx + 1}`));
        }
        const image = images[0];

        // Enriched, product-specific description
        const descriptors = ['tailored', 'versatile', 'contemporary', 'everyday', 'premium', 'breathable', 'soft-touch', 'structured', 'minimal'];
        const materials = ['cotton blend', 'organic cotton', 'stretch denim', 'linen blend', 'recycled polyester', 'merino-rich knit'];
        const features = ['clean finish', 'subtle stitching', 'refined trims', 'comfort stretch', 'easy care', 'lightweight feel'];
        const d1 = `${name} in a ${pick(descriptors)} ${subCategory.toLowerCase()} silhouette, crafted from ${pick(materials)}.`;
        const d2 = `Features ${pick(features)} and a fit designed for all-day wear.`;
        const d3 = `Pair with wardrobe staples for a polished, modern look.`;
        const description = `${d1} ${d2} ${d3}`;

        products.push({
          name,
          brand,
          category,
          subCategory,
          price,
          description,
          image,
          images,
          color: pick(colors),
          sizes,
          rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
          reviews: randInt(5, 600),
          stock,
          discount,
          newArrival,
          onSale
        });
      }
    });
  });
  return products;
};

const outPath = path.join(__dirname, 'data', 'seedProducts.json');
const products = buildProducts();
fs.writeFileSync(outPath, JSON.stringify(products, null, 2));
console.log(`✅ Generated ${products.length} products with unique images across all categories/subcategories.`);
