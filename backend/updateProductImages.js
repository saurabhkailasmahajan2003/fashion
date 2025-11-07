import mongoose from "mongoose";
import Product from "./models/Product.js";
import dotenv from "dotenv";

dotenv.config();

const slug = (s) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
const sigFrom = (p) => {
  const base = [p._id, p.category, p.subCategory, p.brand, p.name, p.color].map((x) => x || '').join('|');
  let h = 0;
  for (let i = 0; i < base.length; i++) h = (h * 31 + base.charCodeAt(i)) >>> 0;
  return h;
};
const picsumUrl = (seed) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/1000`;

async function updateImages() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fashion_store';
    await mongoose.connect(uri);
    const products = await Product.find();
    for (const product of products) {
      const seed = `${slug(product.category)}-${slug(product.subCategory)}-${slug(product.brand)}-${slug(product.name)}-${sigFrom(product)}`;
      const url = picsumUrl(seed);
      product.image = url;
      product.images = [url];
      await product.save();
    }
    console.log(`✅ Updated ${products.length} products with new images!`);
    process.exit();
  } catch (err) {
    console.error("❌ Error updating images:", err);
    process.exit(1);
  }
}

updateImages();
