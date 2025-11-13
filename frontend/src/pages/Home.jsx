import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api.js';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';
import ElegantFashionHero from '../components/Hero/ElegantFashionHero.jsx';
import RecommendedProductsCustom from '../components/RecommendedProductsCustom.jsx';
import CategoryShowcase from '../components/CategoryShowcase.jsx';
import FeaturedCollection from '../components/FeaturedCollection.jsx';
import Stats from '../components/Stats.jsx';
import FashionBlog from '../components/FashionBlog.jsx';
import CardGrid from '../components/CardGrid.jsx';

export default function Home() {
  const [data, setData] = useState({ products: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get('/products', { params: { limit: 8, isNewArrival: true } });
        setData(res);
      } catch (e) {
        setData({ products: [] });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ElegantFashionHero />
      
  {/* Stats Section */}
  <Stats />

  {/* Featured Collections */}
  <FeaturedCollection />
      
  {/* Recommended Products */}
  <div className="bg-primary-50 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4"
            >
              Recommended For You
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 max-w-2xl mx-auto"
            >
              Curated picks based on your style preferences
            </motion.p>
          </div>
          <RecommendedProductsCustom />
        </div>
      </div>

  {/* Category Showcase */}
  <CategoryShowcase />

  {/* New Arrivals Section */}
  <CardGrid 
    title="New Arrivals"
    subtitle="Discover our latest collection of fashion-forward pieces"
    containerClass="bg-primary-50"
    showViewAll
    viewAllLink="/shop?new=true"
  >
    {loading ? (
      <Loader />
    ) : (
      data.products.map((product) => (
        <motion.div
          key={product._id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="h-full"
        >
          <ProductCard product={product} />
        </motion.div>
      ))
    )}
  </CardGrid>

      {/* Fashion Blog Section */}
      <FashionBlog />
    </motion.div>
  );
}


