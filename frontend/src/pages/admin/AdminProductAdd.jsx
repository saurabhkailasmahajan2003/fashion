import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import api from '../../api.js';
import { useToast } from '../../components/ui/ToastProvider.jsx';

const brands = ['Nike','Adidas','Puma','Zara','H&M','Uniqlo'];
// Must match backend enum: ['Mens','Womens','Kids']
const categories = ['Mens','Womens','Kids'];
const sizeOptions = {
  Mens: ['XS','S','M','L','XL','XXL'],
  Womens: ['XS','S','M','L','XL'],
  Kids: ['2-3Y','4-5Y','6-7Y','8-9Y','10-11Y']
};
const subcategorySuggestions = {
  Mens: ['T-Shirts','Shirts','Jeans','Sneakers','Watches','Jackets'],
  Womens: ['Dresses','Tops','Heels','Handbags','Skirts','Sarees'],
  Kids: ['T-Shirts','Shorts','Sneakers','Sets','Frocks']
};

export default function AdminProductAdd() {
  const [form, setForm] = useState({ name: '', brand: '', category: '', subCategory: '', price: '', countInStock: '', description: '', newArrival: true, discount: '' });
  const [images, setImages] = useState([]);
  const [imageInput, setImageInput] = useState('');
  const [sizes, setSizes] = useState([]);
  const [sizeInput, setSizeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const { push } = useToast();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const addImage = () => {
    const url = imageInput.trim();
    if (!url) return;
    try { new URL(url); } catch { return; }
    setImages(prev => prev.includes(url) ? prev : [...prev, url]);
    setImageInput('');
  };
  const onImageKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } };
  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));
  const movePrimary = (idx) => setImages(prev => [prev[idx], ...prev.filter((_, i) => i !== idx)]);

  const addSize = (val) => {
    const v = (val ?? sizeInput).trim();
    if (!v) return;
    setSizes(prev => prev.includes(v) ? prev : [...prev, v]);
    setSizeInput('');
  };
  const removeSize = (v) => setSizes(prev => prev.filter(s => s !== v));

  const errors = useMemo(() => {
    const e = {};
    if (!form.name || form.name.trim().length < 3) e.name = 'Enter a product name (min 3 chars)';
    if (!form.brand) e.brand = 'Select or enter a brand';
    if (!form.category) e.category = 'Select a category';
    if (!form.subCategory || form.subCategory.trim().length === 0) e.subCategory = 'Enter a sub-category';
    const p = Number(form.price);
    if (!(p > 0)) e.price = 'Enter a valid price';
    const s = Number(form.countInStock);
    if (!(s >= 0)) e.countInStock = 'Enter valid stock';
    const d = form.discount === '' ? 0 : Number(form.discount);
    if (!(d >= 0 && d <= 90)) e.discount = 'Discount must be between 0 and 90';
    if (images.length === 0) e.images = 'Add at least one image URL';
    if (sizes.length === 0) e.sizes = 'Add at least one size';
    return e;
  }, [form, images, sizes]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    if (!isValid) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        // Backend expects `stock` and requires `subCategory`
        stock: Number(form.countInStock) || 0,
        newArrival: !!form.newArrival,
        image: images[0] || '',
        images,
        sizes,
        discount: Number(form.discount) || 0
      };
      await api.post('/products', payload);
      setMsg('Product created');
      push({ variant: 'success', title: 'Product added', description: `${form.name || 'Product'} has been created.` });
      setForm({ name: '', brand: '', category: '', subCategory: '', price: '', countInStock: '', description: '', newArrival: true, discount: '' });
      setImages([]);
      setImageInput('');
      setSizes([]);
      setSizeInput('');
    } catch (e1) {
      setErr(e1?.response?.data?.message || 'Failed to create product');
      push({ variant: 'error', title: 'Add failed', description: e1?.response?.data?.message || 'Failed to create product' });
    } finally { setLoading(false); }
  };

  // Persist draft to localStorage
  const draftKey = 'admin_add_product_draft';
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const d = JSON.parse(raw);
        setForm({
          name: d.name||'', brand: d.brand||'', category: d.category||'', subCategory: d.subCategory||'',
          price: d.price||'', countInStock: d.countInStock||'', description: d.description||'', newArrival: d.newArrival ?? true,
          discount: d.discount||''
        });
        setImages(Array.isArray(d.images) ? d.images : []);
        setSizes(Array.isArray(d.sizes) ? d.sizes : []);
      }
    } catch {}
  }, []);
  useEffect(() => {
    const d = { ...form, images, sizes };
    try { localStorage.setItem(draftKey, JSON.stringify(d)); } catch {}
  }, [form, images, sizes]);
  const clearDraft = () => { try { localStorage.removeItem(draftKey); } catch {};
    setForm({ name: '', brand: '', category: '', subCategory: '', price: '', countInStock: '', description: '', newArrival: true, discount: '' });
    setImages([]); setSizes([]); setImageInput(''); setSizeInput('');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
        {msg && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded">{msg}</div>}
        {err && <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded">{err}</div>}
        <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Name</label>
                <input className={`w-full border rounded px-3 py-2 ${errors.name?'border-red-300':'border-gray-200'}`} name="name" placeholder="Product name" value={form.name} onChange={onChange} />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Brand</label>
                <input list="brandList" className={`w-full border rounded px-3 py-2 ${errors.brand?'border-red-300':'border-gray-200'}`} name="brand" placeholder="Brand" value={form.brand} onChange={onChange} />
                <datalist id="brandList">{brands.map(b=> <option key={b} value={b} />)}</datalist>
                {errors.brand && <p className="text-xs text-red-600 mt-1">{errors.brand}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Category</label>
                <select className={`w-full border rounded px-3 py-2 ${errors.category?'border-red-300':'border-gray-200'}`} name="category" value={form.category} onChange={onChange}>
                  <option value="">Select category</option>
                  {categories.map(c=> <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Sub-category</label>
                <input className={`w-full border rounded px-3 py-2 ${errors.subCategory?'border-red-300':'border-gray-200'}`} name="subCategory" placeholder="e.g. T-Shirts, Sneakers, Watches" value={form.subCategory} onChange={onChange} />
                {errors.subCategory && <p className="text-xs text-red-600 mt-1">{errors.subCategory}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Price</label>
                <input className={`w-full border rounded px-3 py-2 ${errors.price?'border-red-300':'border-gray-200'}`} name="price" type="number" step="0.01" min="0" placeholder="0" value={form.price} onChange={onChange} />
                {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Stock</label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={()=>setForm(f=>({...f, countInStock: String(Math.max(0, Number(f.countInStock||0)-1))}))} className="px-2 py-1 border border-gray-200 rounded">-</button>
                  <input className={`w-full border rounded px-3 py-2 ${errors.countInStock?'border-red-300':'border-gray-200'}`} name="countInStock" type="number" min="0" placeholder="0" value={form.countInStock} onChange={onChange} />
                  <button type="button" onClick={()=>setForm(f=>({...f, countInStock: String((Number(f.countInStock||0)+1))}))} className="px-2 py-1 border border-gray-200 rounded">+</button>
                </div>
                {errors.countInStock && <p className="text-xs text-red-600 mt-1">{errors.countInStock}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Discount (%)</label>
                <input className={`w-full border rounded px-3 py-2 ${errors.discount?'border-red-300':'border-gray-200'}`} name="discount" type="number" min="0" max="90" placeholder="0" value={form.discount} onChange={onChange} />
                {errors.discount && <p className="text-xs text-red-600 mt-1">{errors.discount}</p>}
                {Number(form.discount||0) > 0 && Number(form.price||0) > 0 && (
                  <div className="text-sm text-gray-600 mt-1">
                    After discount: <span className="font-semibold text-emerald-700">₹{Math.round(Number(form.price) * (1 - Number(form.discount)/100)).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Description</label>
              <textarea className="w-full border rounded px-3 py-2 border-gray-200" name="description" placeholder="Write a short compelling description" rows={5} maxLength={500} value={form.description} onChange={onChange} />
              <div className="text-xs text-gray-500 mt-1">{(form.description||'').length}/500</div>
            </div>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={!!form.newArrival} onChange={(e)=>setForm(f=>({...f, newArrival: e.target.checked}))} />
                <span>Mark as New Arrival</span>
              </label>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Images</label>
              <div className="flex gap-2">
                <input className={`flex-1 border rounded px-3 py-2 ${errors.images?'border-red-300':'border-gray-200'}`} placeholder="Paste image URL and press Enter or click Add" value={imageInput} onChange={e=>setImageInput(e.target.value)} onKeyDown={onImageKey} />
                <button type="button" onClick={addImage} className="px-3 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">Add</button>
              </div>
              {errors.images && <p className="text-xs text-red-600 mt-1">{errors.images}</p>}
              {images.length>0 && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {images.map((url, idx)=> (
                    <div key={idx} className="relative group border rounded-lg overflow-hidden">
                      <img src={url} alt="preview" className="w-full h-28 object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                        <button type="button" onClick={()=>movePrimary(idx)} className="text-xs px-2 py-1 bg-white rounded">Make primary</button>
                        <button type="button" onClick={()=>removeImage(idx)} className="text-xs px-2 py-1 bg-red-600 text-white rounded">Remove</button>
                      </div>
                      {idx===0 && <span className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 bg-emerald-600 text-white rounded">Primary</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <button disabled={loading || !isValid} className="px-4 py-2 rounded text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">{loading ? 'Saving...' : 'Create product'}</button>
              <button type="button" onClick={clearDraft} className="ml-2 px-4 py-2 rounded border border-gray-200 hover:bg-gray-50">Clear draft</button>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100">
            <h3 className="font-semibold mb-3">Live Preview</h3>
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 h-48 flex items-center justify-center">
                {images[0] ? <img src={images[0]} alt="preview" className="h-48 w-full object-cover" /> : <span className="text-gray-400">Image preview</span>}
              </div>
              <div className="p-3 space-y-1">
                <div className="text-sm text-gray-500">{form.brand || 'Brand'}</div>
                <div className="font-semibold">{form.name || 'Product name'}</div>
                <div className="text-emerald-700 font-semibold">₹{Number(form.price||0).toLocaleString()}</div>
                <div className="text-xs text-gray-500">Stock: {form.countInStock!==''? form.countInStock : 0}</div>
                {sizes.length>0 && (
                  <div className="text-xs text-gray-500">Sizes: {sizes.join(', ')}</div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-2">Sizes</h4>
              <div className="flex flex-wrap gap-2 mb-2">
                {(sizeOptions[form.category] || []).map(opt => (
                  <button type="button" key={opt} onClick={()=>addSize(opt)} className={`px-2 py-1 rounded border text-sm ${sizes.includes(opt)?'bg-emerald-600 text-white border-emerald-600':'border-gray-200 hover:bg-gray-50'}`}>{opt}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <input className="flex-1 border rounded px-3 py-2 border-gray-200" placeholder="Custom size (e.g., 28, 30, Free) and press Enter" value={sizeInput} onChange={e=>setSizeInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); addSize(); } }} />
                <button type="button" onClick={()=>addSize()} className="px-3 py-2 rounded border border-gray-200 hover:bg-gray-50">Add size</button>
              </div>
              {errors.sizes && <p className="text-xs text-red-600 mt-1">{errors.sizes}</p>}
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-2">Sub-category suggestions</h4>
              <datalist id="subcatList">
                {(subcategorySuggestions[form.category] || []).map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
