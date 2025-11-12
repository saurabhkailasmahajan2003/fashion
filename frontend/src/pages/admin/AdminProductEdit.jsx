import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import api from '../../api.js';
import { useToast } from '../../components/ui/ToastProvider.jsx';
const CATEGORIES = ['Mens','Womens','Kids'];

export default function AdminProductEdit() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const { push } = useToast();

  useEffect(() => {
    (async () => {
      setLoading(true); setError('');
      try {
        const { data: res } = await api.get('/products', { params: { limit: 100 } });
        setProducts(res?.products || []);
      } catch (e) {
        setError('Failed to load products');
      } finally { setLoading(false); }
    })();
  }, []);

  const startEdit = (p) => setEditing({ ...p, price: p.price || 0, countInStock: p.stock ?? p.countInStock ?? 0, image: p.images?.[0] || p.image || '', subCategory: p.subCategory || '' });

  const saveEdit = async () => {
    if (!editing?._id) return;
    setSaving(true);
    try {
      const payload = {
        name: editing.name,
        brand: editing.brand,
        category: editing.category,
        subCategory: editing.subCategory,
        price: Number(editing.price) || 0,
        // backend uses `stock`
        stock: Number(editing.countInStock) || 0,
        description: editing.description,
        images: editing.image ? [editing.image] : (editing.images || [])
      };
      const { data: updated } = await api.put(`/products/${editing._id}`, payload);
      setProducts((arr) => arr.map((p) => (p._id === editing._id ? { ...p, ...updated } : p)));
      setEditing(null);
      push({ variant: 'success', title: 'Product updated', description: `${updated?.name || 'Product'} saved.` });
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to save';
      push({ variant: 'error', title: 'Update failed', description: msg });
    } finally { setSaving(false); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Products</h1>
        {loading ? <div>Loading...</div> : error ? <div className="text-red-600">{error}</div> : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Price</th>
                  <th className="text-left px-4 py-3">Stock</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3">₹{(p.price || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">{p.countInStock || 0}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => startEdit(p)} className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700">Edit</button>
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

        {editing && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-lg rounded-xl p-4 border border-gray-100">
              <div className="text-lg font-semibold mb-3">Edit Product</div>
              <div className="grid grid-cols-1 gap-3">
                <input className="border p-2 rounded" value={editing.name} onChange={(e)=>setEditing({...editing, name:e.target.value})} />
                <input className="border p-2 rounded" placeholder="Brand" value={editing.brand||''} onChange={(e)=>setEditing({...editing, brand:e.target.value})} />
                <select className="border p-2 rounded" value={editing.category||''} onChange={(e)=>setEditing({...editing, category:e.target.value})}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c=> <option key={c} value={c}>{c}</option>)}
                </select>
                <input className="border p-2 rounded" placeholder="Sub-category" value={editing.subCategory||''} onChange={(e)=>setEditing({...editing, subCategory:e.target.value})} />
                <input className="border p-2 rounded" placeholder="Price" type="number" value={editing.price} onChange={(e)=>setEditing({...editing, price:e.target.value})} />
                <input className="border p-2 rounded" placeholder="Stock" type="number" value={editing.countInStock} onChange={(e)=>setEditing({...editing, countInStock:e.target.value})} />
                <input className="border p-2 rounded" placeholder="Image URL" value={editing.image} onChange={(e)=>setEditing({...editing, image:e.target.value})} />
                <textarea className="border p-2 rounded" placeholder="Description" value={editing.description||''} onChange={(e)=>setEditing({...editing, description:e.target.value})} />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={()=>setEditing(null)} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Cancel</button>
                <button disabled={saving} onClick={saveEdit} className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">{saving?'Saving...':'Save'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
