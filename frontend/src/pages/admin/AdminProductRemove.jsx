import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import api from '../../api.js';
import { useToast } from '../../components/ui/ToastProvider.jsx';

export default function AdminProductRemove() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const { push } = useToast();

  const load = async () => {
    setLoading(true); setError('');
    try {
      const { data: res } = await api.get('/products', { params: { limit: 100 } });
      setProducts(res?.products || []);
    } catch (e) {
      setError('Failed to load products');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!id) return;
    const yes = window.confirm('Delete this product?');
    if (!yes) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/products/${id}`);
      setProducts((arr)=>arr.filter(p=>p._id !== id));
      push({ variant: 'success', title: 'Product deleted', description: 'The product has been removed.' });
    } catch (e) {
      push({ variant: 'error', title: 'Delete failed', description: e?.response?.data?.message || 'Delete failed' });
    } finally { setDeletingId(null); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Remove Products</h1>
        {loading ? <div>Loading...</div> : error ? <div className="text-red-600">{error}</div> : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3">Product</th>
                  <th className="text-left px-4 py-3">Price</th>
                  <th className="text-left px-4 py-3">Stock</th>
                  <th className="text-left px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-t border-gray-100">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <img src={p.images?.[0] || p.image || '/images/placeholder.png'} alt={p.name} className="w-10 h-10 object-cover rounded" />
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.brand || '—'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">₹{(p.price || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">{p.countInStock || 0}</td>
                    <td className="px-4 py-3">
                      <button disabled={deletingId===p._id} onClick={()=>remove(p._id)} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">{deletingId===p._id?'Deleting...':'Delete'}</button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">No products</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
