import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../api/productAPI.js';
import ProductCard from '../components/ProductCard.jsx';
import Pagination from '../components/Pagination.jsx';
import Loader from '../components/Loader.jsx';
import FilterPanel from '../components/Filters/FilterPanel.jsx';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ products: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const page = Number(searchParams.get('page') || 1);
  const keyword = searchParams.get('q') || '';
  const onSale = searchParams.get('sale') || '';
  const isNewArrival = searchParams.get('new') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const colors = searchParams.get('colors') || '';
  const sizes = searchParams.get('sizes') || '';
  const brands = searchParams.get('brands') || '';

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetchProducts({ page, keyword, onSale, isNewArrival, minPrice, maxPrice, colors, sizes, brands });
      setData(res);
      setLoading(false);
    })();
  }, [page, keyword, onSale, isNewArrival, minPrice, maxPrice, colors, sizes, brands]);

  const onPageChange = (next) => setSearchParams({ page: String(next), q: keyword, sale: onSale, new: isNewArrival });

  const applyFilters = (nextKeyword, nextSale, nextNew) => {
    const params = new URLSearchParams();
    if (nextKeyword) params.set('q', nextKeyword);
    if (nextSale) params.set('sale', nextSale);
    if (nextNew) params.set('new', nextNew);
    params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Shop</h2>
          <button
            className="md:hidden px-3 py-1.5 text-sm rounded-md text-gray-500 hover:text-gray-700"
            onClick={() => applyFilters('', '', '')}
          >
            Clear all
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="relative">
            <input
              className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2.5 text-sm"
              placeholder="Search products..."
              defaultValue={keyword}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyFilters(e.currentTarget.value.trim(), onSale, isNewArrival);
                }
              }}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                defaultChecked={onSale === 'true'}
                onChange={(e) => applyFilters(keyword, e.target.checked ? 'true' : '', isNewArrival)}
              />
              <span className="font-medium">Sale</span>
            </label>
            <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                defaultChecked={isNewArrival === 'true'}
                onChange={(e) => applyFilters(keyword, onSale, e.target.checked ? 'true' : '')}
              />
              <span className="font-medium">New Arrival</span>
            </label>
          </div>
        </div>
      </div>
      {/* Mobile Filter Button */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="w-full py-2 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
          Filters
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Overlay */}
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setMobileFiltersOpen(false)} />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                  <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                      <button
                        type="button"
                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                        onClick={() => setMobileFiltersOpen(false)}
                      >
                        <span className="absolute -inset-0.5" />
                        <span className="sr-only">Close panel</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-8">
                      <FilterPanel
                        params={searchParams}
                        onChange={(next) => {
                          setSearchParams(next);
                          setMobileFiltersOpen(false);
                        }}
                        title="Refine Results"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="md:flex md:gap-6">
        <div className="hidden md:block md:w-64">
          <FilterPanel
            params={searchParams}
            onChange={(next) => setSearchParams(next)}
            title="Refine Results"
          />
        </div>
        <div className="flex-1">
          {loading ? (
            <Loader />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                {data.products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              <div className="mt-8 lg:mt-12">
                <Pagination page={data.page} pages={data.pages} onPageChange={onPageChange} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


