import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const HeroFloatingCard = ({ title, subtitle, price, bg = 'bg-white' }) => (
  <div className={`rounded-2xl p-3 sm:p-4 w-full sm:w-56 ${bg} shadow border border-gray-100`}> 
    <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 mb-2 sm:mb-3 flex items-center justify-center">
      <div className="w-16 sm:w-20 h-24 sm:h-28 bg-gradient-to-br from-rose-100 to-amber-100 rounded-md" />
    </div>
    <div className="text-xs sm:text-sm font-medium text-gray-900">{title}</div>
    <div className="text-xs text-gray-500">{subtitle}</div>
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
    <section className="relative py-6 sm:py-12 bg-emerald-50 overflow-hidden">
      {/* Mobile full-bleed background */}
      <div className="absolute inset-0 sm:hidden">
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop"
          alt="Hero background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-emerald-900/30" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Rounded mint container */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl sm:rounded-3xl p-3 sm:p-8 lg:p-12 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-8 items-start">
            {/* LEFT content */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="rounded-2xl bg-transparent sm:bg-emerald-50 p-2.5 sm:p-4 text-center sm:text-left">
                <div className="text-[11px] sm:text-sm text-gray-100 sm:text-gray-700 mb-2 sm:mb-4 md:mb-6 tracking-wider">LIMITED EDITION</div>
                <h1 className="font-serif text-4xl sm:text-5xl md:text-5xl lg:text-6xl text-white sm:text-gray-900 leading-tight mb-3 sm:mb-4">
                  <span className="block mb-1 sm:mb-2">Beauty Comes First.</span>
                  <span className="block text-[0.9em]">Style Follows Every Step.</span>
                </h1>

                <p className="text-sm sm:text-base text-emerald-50 sm:text-gray-600 max-w-2xl mx-auto sm:mx-0 mb-4 sm:mb-6 leading-relaxed">Whether it's a quick touch‑up or a full transformation, we're here to bring your unique style to life.</p>

                {/* Mobile-first search (stacked) */}
                <div className="w-full max-w-xl mx-auto sm:mx-0">
                  {/* Mobile variant */}
                  <div className="sm:hidden space-y-2">
                    <div className="flex items-center rounded-lg border border-gray-200 bg-white px-3">
                      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                      <input
                        placeholder="Search products, services..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); }}
                        className="flex-1 h-11 bg-transparent outline-none px-3 text-sm text-gray-700"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => submitSearch()} className="btn btn-primary flex-1 px-4 py-2 rounded-full text-sm">Search</button>
                    </div>
                    {/* Horizontal chips */}
                    <div className="-mx-4 px-4 overflow-x-auto no-scrollbar">
                      <div className="flex items-center gap-2 min-w-max mt-1">
                        {['Home','Institute','Hair','Makeup','Skincare','Wellness'].map((c) => (
                          <button key={c} onClick={() => goCategory(c)} className="px-3 py-2 rounded-full bg-white/90 text-emerald-800 font-medium text-xs whitespace-nowrap">
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
              <div className="w-full max-w-[320px] sm:max-w-sm rounded-xl overflow-hidden shadow-lg border border-emerald-200 bg-white">
                <div className="relative">
                  <img src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=900&auto=format&fit=crop" 
                       alt="Model" 
                       className="w-full h-64 sm:h-72 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="p-3 sm:p-4 bg-white">
                  <div className="text-xs sm:text-sm text-gray-500">Recommended</div>
                  <div className="mt-1 sm:mt-2 text-base sm:text-lg font-semibold text-gray-900">Deep Conditioning Treatments</div>
                  <div className="text-xs text-gray-500 mt-0.5 sm:mt-1">Beause Monde du Esthetique • 2.3k+ reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dark green band */}
        <div className="mt-6 sm:mt-8 bg-emerald-800 text-emerald-50 rounded-t-[24px] sm:rounded-t-[40px] px-4 sm:px-8 py-6 sm:py-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-serif mb-3 sm:mb-4">Lifestyle and Wellness</h2>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <button onClick={() => navigate('/checkout')} 
                        className="w-full sm:w-auto btn btn-primary px-5 py-3 rounded-full font-semibold text-sm sm:text-base bg-emerald-600 hover:bg-emerald-500 transition-colors">
                  Shop Now
                </button>
                <Link to="/shop" className="w-full sm:w-auto px-5 py-3 rounded-full font-semibold text-sm sm:text-base bg-white/10 hover:bg-white/20 transition-colors">Explore</Link>
                <div className="flex items-center gap-3 mt-3 sm:mt-0">
                  <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-sm hover:bg-white/20 transition-colors cursor-pointer">IG</div>
                  <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-sm hover:bg-white/20 transition-colors cursor-pointer">F</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 mt-4 lg:mt-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                {['Hairdressing','Well Massage','Eye Care','Nail Beauty'].map((cat) => (
                  <button 
                    key={cat} 
                    onClick={() => goCategory(cat)} 
                    className="bg-emerald-700 p-3 sm:p-4 md:p-6 rounded-lg text-center text-xs sm:text-sm 
                               hover:bg-emerald-600 transition-colors flex items-center justify-center min-h-[60px] sm:min-h-[80px]"
                  >
                    <div>{cat}</div>
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


