import { useState, useMemo } from 'react';
import { createProduct } from '../../api/productAPI';

export default function ProductForm({ onCancel, onCreated }) {
  const [form, setForm] = useState({
    name: '',
    brand: '',
    price: '',
    category: 'Mens',
    subCategory: '',
    images: '',
    description: '',
    stock: 0,
    color: '',
    sizes: '',
    discount: 0,
    newArrival: false,
    onSale: false
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const subcategoriesMap = useMemo(() => ({
    Mens: ['Shirts', 'Jeans', 'Jackets', 'Shoes', 'Accessories'],
    Womens: ['Dresses', 'Tops', 'Skirts', 'Bags', 'Jewelry'],
    Kids: ['Boys', 'Girls', 'Baby']
  }), []);

  const imageList = useMemo(() => (form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : []), [form.images]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const nextErrors = {};
      if (!form.name?.trim()) nextErrors.name = 'Name is required';
      if (!form.category) nextErrors.category = 'Category is required';
      if (!form.subCategory?.trim()) nextErrors.subCategory = 'Sub Category is required';
      if (!form.price || Number(form.price) <= 0) nextErrors.price = 'Enter a valid price';
      if (Object.keys(nextErrors).length) {
        setErrors(nextErrors);
        throw new Error(Object.values(nextErrors)[0]);
      }

      const payload = {
        name: form.name,
        brand: form.brand,
        price: Number(form.price || 0),
        category: form.category,
        subCategory: form.subCategory,
        images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
        description: form.description,
        stock: Number(form.stock || 0),
        color: form.color || undefined,
        sizes: form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
        discount: Number(form.discount || 0),
        newArrival: !!form.newArrival,
        onSale: !!form.onSale
      };
      const created = await createProduct(payload);
      onCreated && onCreated(created);
    } catch (err) {
      console.error('Create product failed:', err?.response?.data || err);
      const msg = err?.response?.data?.message || err.message || 'Failed to create product. Please try again.';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700">Name</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Classic Cotton Shirt" className={`w-full mt-1 px-3 py-2 border rounded-md ${errors.name ? 'border-red-300' : ''}`} />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm text-gray-700">Brand</label>
          <input name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Etro" className="w-full mt-1 px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Price (₹)</label>
          <input name="price" value={form.price} onChange={handleChange} type="number" min={0} step="0.01" placeholder="e.g. 1499" className={`w-full mt-1 px-3 py-2 border rounded-md ${errors.price ? 'border-red-300' : ''}`} />
          {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price}</p>}
        </div>
        <div>
          <label className="block text-sm text-gray-700">Stock</label>
          <input name="stock" value={form.stock} onChange={handleChange} type="number" min={0} className="w-full mt-1 px-3 py-2 border rounded-md" />
        </div>

        <div>
          <label className="block text-sm text-gray-700">Category</label>
          <select name="category" value={form.category} onChange={handleChange} className={`w-full mt-1 px-3 py-2 border rounded-md ${errors.category ? 'border-red-300' : ''}`}>
            <option>Mens</option>
            <option>Womens</option>
            <option>Kids</option>
          </select>
          {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
        </div>
        <div>
          <label className="block text-sm text-gray-700">Sub Category</label>
          <input list="subcat" name="subCategory" value={form.subCategory} onChange={handleChange} placeholder="e.g. Shirts" className={`w-full mt-1 px-3 py-2 border rounded-md ${errors.subCategory ? 'border-red-300' : ''}`} />
          <datalist id="subcat">
            {(subcategoriesMap[form.category] || []).map(s => (<option value={s} key={s} />))}
          </datalist>
          {errors.subCategory && <p className="text-xs text-red-600 mt-1">{errors.subCategory}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-700">Color</label>
          <input name="color" value={form.color} onChange={handleChange} placeholder="e.g. Navy" className="w-full mt-1 px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Sizes (comma separated)</label>
          <input name="sizes" value={form.sizes} onChange={handleChange} placeholder="e.g. S, M, L, XL" className="w-full mt-1 px-3 py-2 border rounded-md" />
        </div>

        <div>
          <label className="block text-sm text-gray-700">Discount (%)</label>
          <input name="discount" value={form.discount} onChange={handleChange} type="number" min={0} max={90} className="w-full mt-1 px-3 py-2 border rounded-md" />
        </div>
        <div className="flex items-center gap-6 mt-6">
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="newArrival" checked={form.newArrival} onChange={handleChange} /> New Arrival</label>
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="onSale" checked={form.onSale} onChange={handleChange} /> On Sale</label>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-700">Images (comma separated URLs)</label>
        <input name="images" value={form.images} onChange={handleChange} placeholder="https://.../img1.jpg, https://.../img2.jpg" className="w-full mt-1 px-3 py-2 border rounded-md" />
        {imageList.length > 0 && (
          <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
            {imageList.map((src, i) => (
              <div className="w-16 h-16 border rounded overflow-hidden bg-gray-50" key={i}>
                <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/images/placeholder.png'; }} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-700">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-md" rows={4} placeholder="Short description" />
      </div>

      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md border hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}