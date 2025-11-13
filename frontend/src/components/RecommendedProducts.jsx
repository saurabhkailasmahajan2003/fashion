import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from './Loader.jsx';
import ProductCard from './ProductCard.jsx';
import api from '../api.js';

const RecommendedProducts = () => {
  const [data, setData] = useState({ products: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get('/products', { params: { limit: 8, onSale: true } });
        setData(res);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <CardGrid 
      title="Recommended For You"
      subtitle="Discover products we think you'll love based on your browsing history"
      showViewAll
      viewAllLink="/shop"
    >
      {loading ? (
        <Loader />
      ) : (
        data.products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))
      )}
    </CardGrid>
  );
};

export default RecommendedProducts;


