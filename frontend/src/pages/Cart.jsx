import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export default function Cart() {
  const { items, removeFromCart, updateQty, totals } = useCart();
  const navigate = useNavigate();
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 lg:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 font-display">Shopping Cart</h1>
      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600 mb-6">Your cart is empty</p>
          <Link 
            to="/shop" 
            className="inline-flex items-center justify-center btn btn-primary"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <div className="hidden sm:grid sm:grid-cols-[2fr_1fr_1fr_auto] gap-4 px-4 py-2 bg-gray-50 rounded-t-lg text-sm font-medium text-gray-600">
              <div>Product</div>
              <div className="text-center">Price</div>
              <div className="text-center">Quantity</div>
              <div></div>
            </div>
            <div className="divide-y divide-gray-100 border-t border-b sm:border sm:rounded-b-lg">
              {items.map((i) => (
                <div key={i.product} className="flex flex-col sm:grid sm:grid-cols-[2fr_1fr_1fr_auto] gap-4 p-4 items-start sm:items-center">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img 
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200" 
                      src={i.data?.images?.[0] || 'https://via.placeholder.com/80'} 
                      alt={i.data?.name}
                    />
                    <Link 
                      className="flex-1 text-gray-900 hover:text-primary-600 font-medium" 
                      to={`/product/${i.product}`}
                    >
                      {i.data?.name}
                    </Link>
                  </div>
                  <div className="text-gray-900 sm:text-center order-3 sm:order-none">
                    ₹{Number(i.data?.price || 0).toLocaleString()}
                  </div>
                  <div className="flex items-center sm:justify-center order-2 sm:order-none">
                    <div className="relative w-24">
                      <input 
                        className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                        type="number" 
                        min="1" 
                        value={i.qty} 
                        onChange={(e) => updateQty(i.product, Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="order-1 sm:order-none ml-auto sm:ml-0">
                    <button 
                      className="btn btn-ghost text-sm"
                      onClick={() => removeFromCart(i.product)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 h-max lg:sticky lg:top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2"><span className="text-gray-600">Items Subtotal</span><span className="font-medium text-gray-900">₹{totals.itemsPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
              <div className="flex justify-between py-2"><span className="text-gray-600">Estimated Tax</span><span className="font-medium text-gray-900">₹{totals.taxPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
              <div className="flex justify-between py-2"><span className="text-gray-600">Shipping</span><span className="font-medium text-gray-900">₹{totals.shippingPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
              <div className="flex justify-between py-3 text-base font-semibold text-gray-900 border-t border-gray-200">
                <span>Order Total</span>
                <span>₹{totals.totalPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/checkout')}
              className="mt-6 w-full btn btn-primary"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


