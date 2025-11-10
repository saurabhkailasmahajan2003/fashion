import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { fetchProducts } from '../../api/productAPI';
import { getAllOrders } from '../../api/ordersAPI';

function ProductForm({ onCancel, onCreated }) {
  const [form, setForm] = useState({ name: '', brand: '', price: '', category: 'Mens', subCategory: '', images: '', description: '', stock: 0 });
  const [saving, setSaving] = useState(false);
  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        brand: form.brand,
        price: Number(form.price || 0),
        category: form.category,
        subCategory: form.subCategory,
        images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
        description: form.description,
        stock: Number(form.stock || 0)
      };
      const created = await createProduct(payload);
      onCreated && onCreated(created);
    } catch (err) {
      console.error('Create product failed', err);
      alert('Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-700">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full mt-1 px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Brand</label>
          <input name="brand" value={form.brand} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Price</label>
          <input name="price" value={form.price} onChange={handleChange} type="number" step="0.01" className="w-full mt-1 px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Category</label>
          <select name="category" value={form.category} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-md">
            <option>Mens</option>
            <option>Womens</option>
            <option>Kids</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Sub Category</label>
          <input name="subCategory" value={form.subCategory} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Stock</label>
          <input name="stock" value={form.stock} onChange={handleChange} type="number" className="w-full mt-1 px-3 py-2 border rounded-md" />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-700">Images (comma separated URLs)</label>
        <input name="images" value={form.images} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-md" />
      </div>

      <div>
        <label className="block text-sm text-gray-700">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-md" rows={4} />
      </div>

      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md border">Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-2 rounded-md bg-primary-600 text-white">{saving ? 'Saving...' : 'Create Product'}</button>
      </div>
    </form>
  );

}

export default function AdminDashboard() {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adding, setAdding] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    lowStock: 0,
    pendingDeliveries: 0
  });

  // Calculate stats
  useEffect(() => {
    if (products.length > 0 && orders.length > 0) {
      setStats({
        totalOrders: orders.length,
        totalProducts: products.length,
        lowStock: products.filter(p => p.stock < 5).length,
        pendingDeliveries: orders.filter(o => !o.isDelivered).length
      });
    }
  }, [products, orders]);

  useEffect(() => {
    if (!loading) {
      if (!user) navigate('/login');
      else if (!user.isAdmin) navigate('/');
    }
  }, [user, loading]);

  useEffect(() => {
    (async () => {
      setLoadingProducts(true);
      try {
        const res = await fetchProducts({ limit: 20 });
        setProducts(res.products || []);
      } catch (_) {
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    })();

    // load orders for admin
    (async () => {
      setLoadingOrders(true);
      try {
        const res = await getAllOrders();
        setOrders(res || []);
      } catch (err) {
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Products</div>
          <div className="text-2xl font-semibold">{products.length}</div>
        </div>
        <div className="rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Orders</div>
          <div className="text-2xl font-semibold">—</div>
        </div>
        <div className="rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Users</div>
          <div className="text-2xl font-semibold">—</div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Products</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAdd(true)} className="px-3 py-2 text-sm rounded-md bg-gray-900 text-white hover:bg-gray-800">Add Product</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Image</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Brand</th>
                <th className="text-left px-4 py-3">Price</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingProducts ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">No products found</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <img src={p.images?.[0] || p.image || 'https://via.placeholder.com/60'} alt={p.name} className="w-12 h-12 rounded object-cover" />
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate">{p.name}</td>
                    <td className="px-4 py-3">{p.brand}</td>
                    <td className="px-4 py-3">₹{p.price?.toLocaleString?.() || p.price}</td>
                    <td className="px-4 py-3">{p.category}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button className="px-2 py-1 rounded border border-gray-200 text-gray-700 hover:bg-gray-50">Edit</button>
                      <button onClick={async () => { if (!confirm('Delete product?')) return; try { await deleteProduct(p._id); setProducts((prev) => prev.filter(x => x._id !== p._id)); } catch (e) { alert('Failed'); } }} className="px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Orders panel */}
      <div className="mt-6 rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Order</th>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingOrders ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No orders found</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id} className="border-t border-gray-100">
                    <td className="px-4 py-3">#{String(o._id).slice(-8)}</td>
                    <td className="px-4 py-3">{o.user?.name || o.user?.email || '—'}</td>
                    <td className="px-4 py-3">₹{(o.totalPrice || o.total || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">{o.isPaid ? 'Paid' : 'Pending'} / {o.isDelivered ? 'Delivered' : 'Not delivered'}</td>
                    <td className="px-4 py-3 space-x-2">
                      {!o.isDelivered && <button onClick={async () => { try { await markOrderDelivered(o._id); setOrders((prev) => prev.map(x => x._id === o._id ? { ...x, isDelivered: true } : x)); } catch (e) { alert('Failed'); } }} className="px-2 py-1 rounded border border-primary-200 text-primary-600 hover:bg-primary-50">Mark Delivered</button>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Add Product</h3>
            <ProductForm onCancel={() => setShowAdd(false)} onCreated={(p) => { setProducts((prev) => [p, ...prev]); setShowAdd(false); }} />
          </div>
        </div>
      )}
    </div>
  );
}


