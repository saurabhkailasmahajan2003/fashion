import { useMemo } from 'react';

const PRICE_RANGES = [
  { id: '0-500', label: 'Under ₹500', min: 0, max: 500 },
  { id: '500-1000', label: '₹500 - ₹1,000', min: 500, max: 1000 },
  { id: '1000-2000', label: '₹1,000 - ₹2,000', min: 1000, max: 2000 },
  { id: '2000-4000', label: '₹2,000 - ₹4,000', min: 2000, max: 4000 },
  { id: '4000-5000', label: '₹4,000 - ₹5,000', min: 4000, max: 5000 },
  { id: '5000+', label: '₹5,000+', min: 5000, max: null }
];

const COLORS = ['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Brown'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const BRANDS = ['Zara', 'H&M', 'Nike', 'Adidas', 'Puma', 'Levis'];

export default function FilterPanel({ params, onChange, title = 'Filters' }) {
  const activeMin = params.get('minPrice');
  const activeMax = params.get('maxPrice');
  const activeColors = useMemo(() => new Set((params.get('colors') || '').split(',').filter(Boolean)), [params]);
  const activeSizes = useMemo(() => new Set((params.get('sizes') || '').split(',').filter(Boolean)), [params]);
  const activeBrands = useMemo(() => new Set((params.get('brands') || '').split(',').filter(Boolean)), [params]);

  const apply = (updates) => {
    const next = new URLSearchParams(params);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') next.delete(k);
      else next.set(k, String(v));
    });
    next.set('page', '1');
    onChange(next);
  };

  const toggleListValue = (key, value) => {
    const next = new URLSearchParams(params);
    const current = (next.get(key) || '').split(',').filter(Boolean);
    const idx = current.indexOf(value);
    if (idx >= 0) current.splice(idx, 1); else current.push(value);
    if (current.length === 0) next.delete(key); else next.set(key, current.join(','));
    next.set('page', '1');
    onChange(next);
  };

  const clearAll = () => {
    const keys = ['minPrice', 'maxPrice', 'colors', 'sizes', 'brands'];
    const next = new URLSearchParams(params);
    keys.forEach((k) => next.delete(k));
    next.set('page', '1');
    onChange(next);
  };

  return (
    <aside className="w-full md:w-64 md:flex-shrink-0">
      <div className="sticky top-24 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <button className="text-xs text-gray-500 hover:text-gray-700" onClick={clearAll}>Clear</button>
        </div>

        <section>
          <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Price</h4>
          <div className="space-y-1">
            {PRICE_RANGES.map((r) => {
              const isActive = String(r.min) === activeMin && String(r.max ?? '') === (activeMax ?? '');
              return (
                <button
                  key={r.id}
                  onClick={() => apply({ minPrice: r.min, maxPrice: r.max ?? '' })}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md border ${isActive ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                >{r.label}</button>
              );
            })}
          </div>
        </section>

        <section>
          <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Color</h4>
          <div className="grid grid-cols-2 gap-2">
            {COLORS.map((c) => (
              <label key={c} className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300"
                  checked={activeColors.has(c)} onChange={() => toggleListValue('colors', c)} />
                <span>{c}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Size</h4>
          <div className="grid grid-cols-3 gap-2">
            {SIZES.map((s) => (
              <label key={s} className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300"
                  checked={activeSizes.has(s)} onChange={() => toggleListValue('sizes', s)} />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Brand</h4>
          <div className="space-y-2">
            {BRANDS.map((b) => (
              <label key={b} className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300"
                  checked={activeBrands.has(b)} onChange={() => toggleListValue('brands', b)} />
                <span>{b}</span>
              </label>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}


