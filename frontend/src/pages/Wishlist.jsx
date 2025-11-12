import { useWishlist } from '../context/WishlistContext.jsx';
import { useEffect, useState } from 'react';
import api from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Wishlist() {
  const { productIds } = useWishlist();
  const [products, setProducts] = useState([]);
  useEffect(() => {
    (async () => {
      if (productIds.length === 0) return setProducts([]);
      const uniqueIds = Array.from(new Set(productIds));
      const results = await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            const { data } = await api.get(`/api/products/${id}`);
            return data;
          } catch (_) {
            return null;
          }
        })
      );
      setProducts(results.filter(Boolean));
    })();
  }, [productIds]);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Wishlist</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}


