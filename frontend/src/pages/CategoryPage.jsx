import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../api/productAPI.js';
import ProductCard from '../components/ProductCard.jsx';
import Pagination from '../components/Pagination.jsx';
import Loader from '../components/Loader.jsx';
import FilterPanel from '../components/Filters/FilterPanel.jsx';

export default function CategoryPage() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ products: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const page = Number(searchParams.get('page') || 1);
  const sub = searchParams.get('sub') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const colors = searchParams.get('colors') || '';
  const sizes = searchParams.get('sizes') || '';
  const brands = searchParams.get('brands') || '';

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetchProducts({ page, category, subCategory: sub, minPrice, maxPrice, colors, sizes, brands });
      setData(res);
      setLoading(false);
    })();
  }, [category, page, sub, minPrice, maxPrice, colors, sizes, brands]);

  const onPageChange = (next) => setSearchParams({ page: String(next), sub });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-end justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{category}</h2>
      </div>
      <div className="md:flex md:gap-6">
        <div className="hidden md:block md:w-64">
          <FilterPanel
            params={searchParams}
            onChange={(next) => setSearchParams(next)}
            title={`${category} Filters`}
          />
        </div>
        <div className="flex-1">
          {loading ? (
            <Loader />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {data.products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              <Pagination page={data.page} pages={data.pages} onPageChange={onPageChange} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}


