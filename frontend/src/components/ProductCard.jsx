import { Link } from 'react-router-dom';
import { Eye, Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function ProductCard({ product }) {
  const { toggle, isWished } = useWishlist();
  const { addToCart } = useCart();
  return (
    <div className="group rounded-xl border border-gray-200 bg-white p-3  h-full flex flex-col">
      <div className="relative">
        <Link to={`/product/${product._id}`} className="block">
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
            <img
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              src={product.images?.[0] || 'https://via.placeholder.com/600'}
              alt={product.name}
            />
          </div>
        </Link>
        <button
          aria-label={isWished(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
          onClick={() => toggle(product._id)}
          className={`absolute top-2 right-2 rounded-full border bg-white/90 backdrop-blur p-2 shadow-sm transition-colors ${isWished(product._id) ? 'border-primary-200 text-primary-600' : 'border-gray-200 text-gray-600 hover:text-gray-800'}`}
        >
          <Heart size={16} fill={isWished(product._id) ? 'currentColor' : 'none'} />
        </button>
        {(product.onSale || product.isNewArrival) && (
          <div className="absolute left-2 top-2 flex gap-1">
            {product.onSale && <span className="rounded-full bg-primary-600/90 text-white text-[10px] px-2 py-0.5">SALE</span>}
            {product.isNewArrival && <span className="rounded-full bg-emerald-600/90 text-white text-[10px] px-2 py-0.5">NEW</span>}
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1 flex-1">
        <div className="text-[11px] text-gray-500 uppercase tracking-wider truncate">{product.brand}</div>
        <Link to={`/product/${product._id}`} className="block">
          <div className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors min-h-[40px] line-clamp-2">{product.name}</div>
        </Link>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="text-base font-bold text-gray-900">₹{product.price.toLocaleString()}</div>
          {product.discount && (
            <div className="text-xs text-gray-400 line-through">₹{Math.round(product.price / (1 - product.discount / 100)).toLocaleString()}</div>
          )}
        </div>
      </div>

      <div className="mt-3 flex gap-2 flex-col sm:flex-row">
        <Link
          to={`/product/${product._id}`}
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600 hover:text-gray-800 hover:border-gray-300 transition-colors w-full sm:w-auto btn btn-secondary"
          title="View Details"
        >
          <Eye size={16} />
        </Link>
        <button
          onClick={() => addToCart(product, 1)}
          className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 btn btn-primary"
        >
          <ShoppingBag size={16} />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}


