import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Helper function to get window width for responsive adjustments
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

const HeroFloatingCard = ({ title, subtitle, price, bg = 'bg-white' }) => (
  <div className={`rounded-2xl p-3 sm:p-4 w-full sm:w-56 ${bg} shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl`}>
    <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 mb-2 sm:mb-3 flex items-center justify-center overflow-hidden">
      <div className="w-16 sm:w-20 h-24 sm:h-28 bg-gradient-to-br from-rose-100 to-amber-100 rounded-md animate-pulse" />
    </div>
    <div className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-1">{title}</div>
    <div className="text-xs text-gray-500 line-clamp-1">{subtitle}</div>
    <div className="text-xs sm:text-sm font-semibold text-gray-900 mt-1 sm:mt-2">₹{price}</div>
  </div>
);

const ElegantFashionHero = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const submitSearch = (q) => {
    const keyword = (q || query || '').trim();
    if (!keyword) return;
    // navigate to shop with keyword
    navigate(`/shop?keyword=${encodeURIComponent(keyword)}`);
  };

  const goCategory = (category) => {
    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  return (
    <section className="relative py-8 sm:py-12 bg-emerald-50 overflow-hidden">
      {/* Mobile full-bleed background */}
      <div className="absolute inset-0 sm:hidden">
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop"
          alt="Hero background"
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-white/80" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Rounded mint container */}
        <div className="bg-white/90 sm:bg-emerald-50 border border-emerald-100 rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-12 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-8 items-start">
            {/* LEFT content */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="rounded-2xl bg-transparent sm:bg-emerald-50 p-3 sm:p-4 text-center sm:text-left">
                <div className="text-xs sm:text-sm text-emerald-700 font-medium mb-3 sm:mb-4 md:mb-6 tracking-wider">LIMITED EDITION</div>
                <h1 className="font-serif text-3xl sm:text-5xl md:text-5xl lg:text-6xl text-gray-900 leading-tight mb-4 sm:mb-5">
                  <span className="block mb-2 sm:mb-3 leading-tight sm:leading-[1.1]">Beauty Comes First.</span>
                  <span className="block text-[0.9em] leading-tight sm:leading-[1.2] text-gray-800">Style Follows Every Step.</span>
                </h1>

                <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto sm:mx-0 mb-5 sm:mb-7 leading-relaxed">
                  Whether it's a quick touch‑up or a full transformation, we're here to bring your unique style to life.
                </p>

                {/* Mobile-first search (stacked) */}
                <div className="w-full max-w-xl mx-auto sm:mx-0">
                  {/* Mobile variant */}
                  <div className="sm:hidden space-y-3">
                    <div className="flex items-center rounded-xl border-2 border-emerald-100 bg-white/95 px-4 shadow-sm">
                      <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <input
                        placeholder="Search products, services..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); }}
                        className="flex-1 h-14 bg-transparent outline-none px-3 text-base text-gray-800 placeholder-gray-400"
                      />
                      {query && (
                        <button 
                          onClick={() => setQuery('')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          aria-label="Clear search"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => submitSearch()} 
                        className="btn btn-primary flex-1 px-6 py-3.5 rounded-xl text-sm font-medium shadow-md hover:shadow-lg active:shadow-inner transition-all duration-200"
                      >
                        Search
                      </button>
                    </div>
                    {/* Horizontal chips */}
                    <div className="-mx-4 px-4 pb-1 overflow-x-auto no-scrollbar">
                      <div className="flex items-center gap-2 min-w-max">
                        {['Home', 'Institute', 'Hair', 'Makeup', 'Skincare', 'Wellness'].map((c) => (
                          <button 
                            key={c} 
                            onClick={() => goCategory(c)} 
                            className="px-4 py-2.5 rounded-full bg-white/95 text-emerald-800 font-medium text-xs sm:text-sm whitespace-nowrap shadow-sm hover:shadow transition-all duration-200 active:scale-95"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Desktop/tablet pill */}
                  <div className="hidden sm:flex flex-wrap items-center gap-3 bg-white rounded-full p-1.5 shadow-sm">
                    <div className="flex gap-2">
                      <button onClick={() => goCategory('Home')} className="px-3 py-1.5 rounded-full bg-emerald-200 text-emerald-800 font-medium text-sm whitespace-nowrap">Home</button>
                      <button onClick={() => goCategory('Institute')} className="px-3 py-1.5 rounded-full text-emerald-700 text-sm whitespace-nowrap">Institute</button>
                    </div>
                    <div className="flex flex-1 items-center min-w-[260px]">
                      <input
                        placeholder="Search products, services..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); }}
                        className="flex-1 bg-transparent outline-none px-4 text-sm text-gray-700"
                      />
                      <button onClick={() => submitSearch()} aria-label="Search" className="bg-amber-400 text-white rounded-full p-2 mr-1">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT card (hidden on mobile to reduce clutter) */}
            <div className="lg:col-span-5 hidden sm:flex justify-center lg:justify-end order-1 lg:order-2">
              <div className="w-full max-w-[320px] sm:max-w-sm rounded-2xl overflow-hidden shadow-xl border-2 border-emerald-100 bg-white transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=900&auto=format&fit=crop" 
                    alt="Model" 
                    className="w-full h-64 sm:h-80 object-cover" 
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    New
                  </div>
                </div>
                <div className="p-4 sm:p-5 bg-white">
                  <div className="text-xs sm:text-sm text-emerald-600 font-medium">Recommended</div>
                  <h3 className="mt-1 sm:mt-2 text-lg sm:text-xl font-bold text-gray-900 leading-snug">Deep Conditioning Treatments</h3>
                  <div className="flex items-center mt-2">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-xs text-gray-600">2.3k+ reviews</span>
                  </div>
                  <button 
                    onClick={() => navigate('/shop?category=Hair')}
                    className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dark green band */}
        <div className="mt-8 sm:mt-10 bg-gradient-to-r from-emerald-800 to-emerald-700 text-emerald-50 rounded-t-[28px] sm:rounded-t-[48px] px-5 sm:px-8 py-8 sm:py-12 shadow-lg">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-serif mb-3 sm:mb-4">Lifestyle and Wellness</h2>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-5">
                <button 
                  onClick={() => navigate('/shop')} 
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm sm:text-base bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg hover:shadow-xl active:shadow-inner transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Shop Now
                </button>
                <Link 
                  to="/shop" 
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm sm:text-base bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>Explore</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <div className="flex items-center gap-3 mt-2 sm:mt-0">
                  <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-200" aria-label="Instagram">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-200" aria-label="Facebook">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 mt-4 lg:mt-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { name: 'Hairdressing', icon: '✂️' },
                  { name: 'Well Massage', icon: '💆‍♀️' },
                  { name: 'Eye Care', icon: '👁️' },
                  { name: 'Nail Beauty', icon: '💅' }
                ].map((cat) => (
                  <button 
                    key={cat.name} 
                    onClick={() => goCategory(cat.name)} 
                    className="group bg-emerald-700/90 hover:bg-emerald-600 p-3 sm:p-4 md:p-5 rounded-xl text-center text-xs sm:text-sm 
                               transition-all duration-300 flex flex-col items-center justify-center min-h-[80px] sm:min-h-[100px]
                               border border-emerald-600/30 hover:border-emerald-400/50 transform hover:-translate-y-1 shadow-sm hover:shadow-lg"
                  >
                    <span className="text-2xl sm:text-3xl mb-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      {cat.icon}
                    </span>
                    <span className="font-medium text-emerald-50 group-hover:text-white">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ElegantFashionHero;


