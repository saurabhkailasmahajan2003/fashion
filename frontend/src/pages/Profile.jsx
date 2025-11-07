import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';
import { motion } from 'framer-motion';
import { LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getMyOrders } from '../api/ordersAPI.js';

export default function Profile() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingOrders(true);
      setOrdersError(null);
      try {
        const data = await getMyOrders();
        if (mounted) setOrders(data || []);
      } catch (err) {
        console.error('Failed to load orders', err);
        if (mounted) setOrdersError(err?.response?.data?.message || err.message || 'Failed to load orders');
      } finally {
        if (mounted) setLoadingOrders(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h2>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h2>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-orange-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
                <p className="text-gray-600 mt-1">{user.email}</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-pink-600 flex items-center justify-center text-white text-2xl font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="px-4 py-3 bg-gray-50 rounded-md text-gray-900">{user.name}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="px-4 py-3 bg-gray-50 rounded-md text-gray-900">{user.email}</div>
            </div>
            {user.isAdmin && (
              <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                Administrator Account
              </div>
            )}
          </div>

          {/* Order history */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Order History</h3>
            {loadingOrders && <div className="text-sm text-gray-500">Loading orders...</div>}
            {ordersError && <div className="text-sm text-red-600">{ordersError}</div>}
            {!loadingOrders && orders.length === 0 && (
              <div className="text-sm text-gray-600">You have no past orders.</div>
            )}
            <div className="space-y-3 mt-4">
              {orders.map((o) => (
                <div key={o._id} className="bg-white border border-gray-100 rounded-lg shadow-sm">
                  <button
                    onClick={() => setExpandedOrder((id) => (id === o._id ? null : o._id))}
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">Order #{String(o._id).slice(-8)}</div>
                      <div className="text-xs text-gray-500">Placed {new Date(o.createdAt || o.updatedAt || Date.now()).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-semibold text-gray-900">₹{(o.totalPrice || o.total || 0).toLocaleString()}</div>
                      <div className={`text-xs px-2 py-1 rounded-full ${o.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{o.isPaid ? 'Paid' : 'Pending'}</div>
                      <div className={`text-xs px-2 py-1 rounded-full ${o.isDelivered ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'}`}>{o.isDelivered ? 'Delivered' : 'Not delivered'}</div>
                      {expandedOrder === o._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>
                  {expandedOrder === o._id && (
                    <div className="px-4 pb-3">
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {o.orderItems?.map((it, i) => (
                          <div key={i} className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                            <img src={it.image || '/images/placeholder.png'} alt={it.name} className="w-16 h-16 object-cover rounded" />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{it.name}</div>
                              <div className="text-xs text-gray-500">Qty: {it.qty} × ₹{it.price.toLocaleString()}</div>
                            </div>
                            <div className="text-sm font-semibold">₹{(it.qty * it.price).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                        <div className="text-sm text-gray-500">Shipping: ₹{(o.shippingPrice || 0).toLocaleString()}</div>
                        <div className="text-sm">
                          <span className="text-gray-500 mr-2">Payment:</span>
                          <span className={`${o.isPaid ? 'text-green-700' : 'text-yellow-700'}`}>{o.isPaid ? 'Paid' : 'Pending'}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500 mr-2">Delivery:</span>
                          <span className={`${o.isDelivered ? 'text-blue-700' : 'text-gray-700'}`}>{o.isDelivered ? 'Delivered' : 'Not delivered'}</span>
                        </div>
                        <div className="sm:col-span-3 text-right text-sm text-gray-900 font-semibold">Total: ₹{(o.totalPrice || o.total || 0).toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </button>
            <Link
              to="/"
              className="flex items-center justify-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


