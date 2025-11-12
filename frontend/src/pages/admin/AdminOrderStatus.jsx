import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import api from '../../api.js';
import { useToast } from '../../components/ui/ToastProvider.jsx';

export default function AdminOrderStatus() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const { push } = useToast();

  const load = async () => {
    setLoading(true); setError('');
    try {
      const { data: res } = await api.get('/orders');
      setOrders(Array.isArray(res) ? res : (res?.orders || []));
    } catch (e) {
      setError('Failed to load orders');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleDelivered = async (order) => {
    if (!order?._id || order.isDelivered) return;
    setUpdatingId(order._id);
    try {
      await api.put(`/orders/${order._id}/deliver`);
      // Update local state so admin sees the change immediately
      setOrders(arr => arr.map(o => o._id === order._id ? { ...o, isDelivered: true, deliveredAt: new Date().toISOString() } : o));
      // Also reload to ensure we reflect server truth and populated fields
      await load();
      push({ variant: 'success', title: 'Order delivered', description: `Order #${order._id.slice(-6)} marked as delivered.` });
    } catch (e) {
      push({ variant: 'error', title: 'Update failed', description: e?.response?.data?.message || 'Failed to update' });
    } finally { setUpdatingId(null); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Change Delivery Status</h1>
        {loading ? <div>Loading...</div> : error ? <div className="text-red-600">{error}</div> : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3">Order</th>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Total</th>
                  <th className="text-left px-4 py-3">Paid</th>
                  <th className="text-left px-4 py-3">Delivered</th>
                  <th className="text-left px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id} className="border-top border-gray-100">
                    <td className="px-4 py-3">#{String(o._id).slice(-8)}</td>
                    <td className="px-4 py-3">{o.user?.name || o.user?.email || '—'}</td>
                    <td className="px-4 py-3">₹{(o.totalPrice || o.total || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${o.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-800'}`}>{o.isPaid ? 'Paid' : 'Pending'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${o.isDelivered ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>{o.isDelivered ? 'Delivered' : 'Not delivered'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        disabled={updatingId===o._id || o.isDelivered}
                        onClick={() => toggleDelivered(o)}
                        className={`px-3 py-1 rounded ${o.isDelivered ? 'bg-gray-200 text-gray-600' : 'bg-emerald-600 text-white hover:bg-emerald-700'} disabled:opacity-50`}
                      >
                        {o.isDelivered ? 'Delivered' : updatingId===o._id ? 'Updating...' : 'Mark delivered'}
                      </button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
