import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import Loader from '../components/Loader.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { toggle, isWished } = useWishlist();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <Loader />;
  if (!product) return <div className="max-w-6xl mx-auto px-4 py-6">Not found</div>;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 lg:py-10">
      <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
        <div className="space-y-4">
          <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-50">
            <img 
              className="w-full h-full object-cover" 
              src={product.images?.[0] || 'https://via.placeholder.com/800'} 
              alt={product.name} 
            />
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2">
            {(product.images || []).map((img, i) => (
              <img 
                key={i} 
                src={img} 
                alt={`${product.name} view ${i + 1}`} 
                className="aspect-square w-full object-cover rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer" 
              />
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 font-display">{product.name}</h1>
          <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-3">
            <div className="text-3xl font-bold text-gray-900">₹{Number(product.price).toLocaleString()}</div>
            <div className="flex gap-2">
              {product.onSale && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  Sale
                </span>
              )}
              {product.isNewArrival && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  New
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <div className="text-sm text-gray-600">Brand: <span className="font-medium text-gray-900">{product.brand}</span></div>
            <div className="text-sm text-gray-600">Category: <span className="font-medium text-gray-900">{product.category} / {product.subCategory}</span></div>
          </div>

          <div className="mt-6">
            <p className="text-base text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-4">
              <label className="font-medium text-gray-700">Quantity</label>
              <div className="relative w-24">
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => addToCart(product, qty)}
                className="flex-1 btn btn-primary"
              >
                Add to Cart
              </button>
              <button
                onClick={() => toggle(product._id)}
                className="flex-1 sm:flex-none btn btn-secondary"
              >
                {isWished(product._id) ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
