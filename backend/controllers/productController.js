import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';

export const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 12;
  const page = Number(req.query.page) || 1;
  
  // Basic filters
  const keyword = req.query.keyword ? { name: { $regex: req.query.keyword, $options: 'i' } } : {};
  const category = req.query.category ? { category: req.query.category } : {};
  const subCategory = req.query.subCategory ? { subCategory: req.query.subCategory } : {};
  const isNewArrival = req.query.isNewArrival ? { newArrival: req.query.isNewArrival === 'true' } : {};
  const onSale = req.query.onSale ? { onSale: req.query.onSale === 'true' } : {};
  
  // Price range filter
  const priceFilter = {};
  if (req.query.minPrice) priceFilter.$gte = Number(req.query.minPrice);
  if (req.query.maxPrice) priceFilter.$lte = Number(req.query.maxPrice);
  const price = Object.keys(priceFilter).length > 0 ? { price: priceFilter } : {};

  // Brand filter
  const brand = req.query.brands ? { brand: { $in: req.query.brands.split(',') } } : {};
  
  // Color filter
  const color = req.query.colors ? { color: { $in: req.query.colors.split(',') } } : {};
  
  // Size filter
  const size = req.query.sizes ? { sizes: { $in: req.query.sizes.split(',') } } : {};
  
  // Rating filter
  const rating = req.query.minRating ? { rating: { $gte: Number(req.query.minRating) } } : {};
  
  // Stock status filter
  const inStock = req.query.inStock ? { stock: { $gt: 0 } } : {};
  
  // Combine all filters
  const filter = {
    ...keyword,
    ...category,
    ...subCategory,
    ...isNewArrival,
    ...onSale,
    ...price,
    ...brand,
    ...color,
    ...size,
    ...rating,
    ...inStock
  };

  // Sorting
  // Default: prioritize explicit new arrivals, then newest by createdAt
  let sortOption = { newArrival: -1, createdAt: -1 };
  if (req.query.sort) {
    switch (req.query.sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1 };
        break;
      case 'popularity':
        sortOption = { reviews: -1 };
        break;
      case 'newest':
        sortOption = { newArrival: -1, createdAt: -1 };
        break;
      default:
        sortOption = { newArrival: -1, createdAt: -1 };
    }
  }

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sortOption)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) return res.json(product);
  return res.status(404).json({ message: 'Product not found' });
});

// Admin: create a new product
export const createProduct = asyncHandler(async (req, res) => {
  // eslint-disable-next-line no-console
  console.log('CreateProduct by:', req.user?._id?.toString?.(), 'payload:', req.body);
  const { name, brand, image, images, description, category, subCategory, price, color, sizes, stock, discount, newArrival, onSale } = req.body;
  const product = new Product({
    name,
    brand,
    image,
    images: images || [],
    description: description || '',
    category,
    subCategory: subCategory || '',
    price: Number(price) || 0,
    color,
    sizes: sizes || [],
    stock: Number(stock) || 0,
    discount: Number(discount) || 0,
    newArrival: !!newArrival,
    onSale: !!onSale
  });
  try {
    const created = await product.save();
    return res.status(201).json(created);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('CreateProduct error:', err);
    if (err?.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    throw err;
  }
});

// Admin: delete a product
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  await product.deleteOne();
  return res.json({ message: 'Product removed' });
});

// Admin: update a product
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const fields = [
    'name','brand','image','images','description','category','subCategory','price','color','sizes','stock','discount','newArrival','onSale'
  ];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      product[f] = req.body[f];
    }
  }

  try {
    const updated = await product.save();
    return res.json(updated);
  } catch (err) {
    if (err?.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    throw err;
  }
});


// Admin: prune duplicate products by image URL (keeps newest per unique URL)
export const pruneDuplicateProductsByImageUrl = asyncHandler(async (req, res) => {
  const normalize = (u) => {
    try {
      const url = new URL(u);
      const host = url.host.toLowerCase();
      const pathname = url.pathname.replace(/\/+$/, '');
      return `${url.protocol}//${host}${pathname}`;
    } catch {
      return (u || '').trim();
    }
  };

  const products = await Product.find({});
  const buckets = new Map(); // normalizedUrl => Product[]
  for (const p of products) {
    const urls = new Set();
    if (p.image) urls.add(normalize(p.image));
    if (Array.isArray(p.images)) for (const im of p.images) if (im) urls.add(normalize(im));
    for (const url of urls) {
      if (!url) continue;
      if (!buckets.has(url)) buckets.set(url, []);
      buckets.get(url).push(p);
    }
  }

  const toDeleteIds = [];
  const summary = [];
  for (const [url, list] of buckets.entries()) {
    if (list.length <= 1) continue;
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // newest first
    const keep = list[0];
    const remove = list.slice(1);
    toDeleteIds.push(...remove.map((r) => r._id));
    summary.push({ url, keep: keep._id, remove: remove.map((r) => r._id) });
  }

  if (toDeleteIds.length === 0) {
    return res.json({ message: 'No duplicates found', deleted: 0, summary: [] });
  }

  await Product.deleteMany({ _id: { $in: toDeleteIds } });
  return res.json({ message: 'Pruned duplicate products by image URL', deleted: toDeleteIds.length, summary });
});

