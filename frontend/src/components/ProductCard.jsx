import { Link } from 'react-router-dom';
import { Eye, Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function ProductCard({ product }) {
  const { toggle, isWished } = useWishlist();
  const { addToCart } = useCart();
  const primary = product?.images?.[0] || product?.image || 'https://via.placeholder.com/600';
  const secondary = product?.images?.[1] || null;
  const totalImages = Array.isArray(product?.images) ? product.images.length : (product?.image ? 1 : 0);
  return (
    <div className="group rounded-xl border border-gray-200 bg-white p-3  h-full flex flex-col">
      <div className="relative">
        <Link to={`/product/${product._id}`} className="block">
          <div className="aspect-[4/5] w-full overflow-hidden rounded-lg bg-gray-50 relative">
            <img
              loading="lazy"
              referrerPolicy="no-referrer"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${secondary ? 'opacity-100 group-hover:opacity-0' : ''}`}
              src={primary}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://placehold.co/800x1000?text=Product';
              }}
            />
            {secondary && (
              <img
                loading="lazy"
                referrerPolicy="no-referrer"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                src={secondary}
                alt={`${product.name} - alternate`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://placehold.co/800x1000?text=Product';
                }}
              />
            )}
          </div>
        </Link>
        <button
          aria-label={isWished(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
          onClick={() => toggle(product._id)}
          className={`absolute top-2 right-2 rounded-full border bg-white/90 backdrop-blur p-2 shadow-sm transition-colors ${isWished(product._id) ? 'border-primary-200 text-primary-600' : 'border-gray-200 text-gray-600 hover:text-gray-800'}`}
        >
          <Heart size={16} fill={isWished(product._id) ? 'currentColor' : 'none'} />
        </button>
        {totalImages > 1 && (
          <span className="absolute bottom-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-white">{totalImages} images</span>
        )}
        {(product.onSale || product.newArrival) && (
          <div className="absolute left-2 top-2 flex gap-1">
            {product.onSale && <span className="rounded-full bg-primary-600/90 text-white text-[10px] px-2 py-0.5">SALE</span>}
            {product.newArrival && <span className="rounded-full bg-emerald-600/90 text-white text-[10px] px-2 py-0.5">NEW</span>}
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1 flex-1">
        <div className="text-[11px] text-gray-500 uppercase tracking-wider truncate">{product.brand}</div>
        <Link to={`/product/${product._id}`} className="block">
          <div className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors min-h-[40px] line-clamp-2">{product.name}</div>
        </Link>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="text-base font-bold text-gray-900">₹{Number(product.price).toLocaleString('en-IN')}</div>
          {product.discount && (
            <div className="text-xs text-gray-400 line-through">₹{Number(Math.round(product.price / (1 - product.discount / 100))).toLocaleString('en-IN')}</div>
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


