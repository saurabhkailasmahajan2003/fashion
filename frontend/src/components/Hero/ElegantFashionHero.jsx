import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// FIX: Removed 'Boot' and will re-use 'Shirt' which is already imported.
import { Search, ShoppingBag, User, Home, Heart, ShoppingCart, Star, Shirt, Sparkles, Watch, Percent, Gift, Clock } from 'lucide-react';

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

// Adapted Floating Card for Fashion Products
const FashionProductCard = ({ id, title, price, imageUrl, onAddClick }) => (
  <div className="relative bg-white rounded-xl shadow-md p-3 flex flex-col w-40 flex-shrink-0 snap-center border border-gray-100">
    <img src={imageUrl} alt={title} className="w-full h-28 object-cover mb-2 rounded" />
    <div className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[2.5rem] mb-1">{title}</div>
    <div className="flex items-baseline mb-2">
      <span className="text-base font-bold text-gray-900">₹{price}</span>
    </div>
    {/* Example Add button, replace with actual logic */}
    <button
      onClick={onAddClick}
      className="absolute bottom-3 right-3 bg-blue-600 text-white rounded-lg px-4 py-1 text-xs font-semibold hover:bg-blue-700 transition-colors"
    >
      ADD
    </button>
  </div>
);


const ElegantFashionHero = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const windowSize = useWindowSize(); // Use window size hook
  const location = useLocation(); // Use useLocation hook

  const submitSearch = (q) => {
    const keyword = (q || query || '').trim();
    if (!keyword) return;
    navigate(`/shop?keyword=${encodeURIComponent(keyword)}`);
  };

  const goCategory = (category) => {
    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  // Mock data for mobile fashion specific elements
  const mobileMainCategories = [
    { name: 'All', icon: <Sparkles className="w-5 h-5" /> },
    { name: 'New Arrivals', icon: <Gift className="w-5 h-5" /> },
    { name: 'Bestsellers', icon: <Star className="w-5 h-5" /> },
    { name: 'Mens', icon: <Shirt className="w-5 h-5" /> },
    { name: 'Womens', icon: <Shirt className="w-5 h-5" /> },
    { name: 'Accessories', icon: <Watch className="w-5 h-5" /> },
    // FIX: Using the 'Shirt' icon as a general apparel icon
    { name: 'Footwear', icon: <Shirt className="w-5 h-5" /> },
  ];
  const mobileFeaturedProducts = [
    { id: 1, title: 'Classic Denim Jacket', price: '1299', imageUrl: 'https://images.unsplash.com/photo-1543728073-cc8218001712?q=80&w=300&auto=format&fit=crop' },
    { id: 2, title: 'Elegant Summer Dress', price: '899', imageUrl: 'https://images.unsplash.com/photo-1548037172-e148de459426?q=80&w=300&auto=format&fit=crop' },
    { id: 3, title: 'Premium Leather Boots', price: '2499', imageUrl: 'https://images.unsplash.com/photo-1562276532-a5e22709292c?q=80&w=300&auto=format&fit=crop' },
    { id: 4, title: 'Minimalist Wrist Watch', price: '1500', imageUrl: 'https://images.unsplash.com/photo-1600885232986-e7845348b61e?q=80&w=300&auto=format&fit=crop' },
  ];

  const mobileTopPills = [
    { name: 'New', icon: <Gift className="w-4 h-4 mr-1" /> },
    { name: 'Latest', icon: <Clock className="w-4 h-4 mr-1" /> },
    { name: 'Sale', icon: <Percent className="w-4 h-4 mr-1" /> },
    { name: 'Exclusive', icon: <Star className="w-4 h-4 mr-1" /> },
  ];

  // --- Mobile-specific layout (mimicking Zepto's UI/UX, but for fashion) ---
  if (windowSize.width < 768) { // Tailwind's 'md' breakpoint
    return (
      <div className="font-sans bg-gray-50 pb-24"> {/* Increased bottom padding for better spacing */}
        {/* Top Bar - Adapted for Fashion App */}
        <div className="sticky top-0 z-50 bg-white shadow-sm pt-4 pb-2 px-4">
          

          {/* Top Pills Category (e.g., for 'New', 'Trending') */}
          <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2">
            {mobileTopPills.map((cat, index) => (
              <button
                key={cat.name}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                  index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => goCategory(cat.name)}
              >
                {cat.icon}
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 bg-white shadow-sm mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for dresses, shoes, accessories..."
              className="w-full py-3 pl-10 pr-4 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Main Categories Row */}
        <div className="px-4 py-3 bg-white shadow-sm mb-4">
          <div className="flex space-x-4 overflow-x-auto no-scrollbar">
            {mobileMainCategories.map((cat) => (
              <button
                key={cat.name}
                className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-blue-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-100 transition-colors"
                onClick={() => goCategory(cat.name)}
              >
                <span className="text-xl mb-1">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Collections / Banners (adapted from "Nisarga Experience") */}
        <div className="px-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Featured Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Use md:grid-cols-2 for tablets in portrait */}
            <div className="relative bg-gradient-to-br from-indigo-100 to-purple-100 p-6 rounded-xl shadow-md overflow-hidden min-h-[120px] flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-indigo-800 mb-1">New Season Drops!</h3>
                <p className="text-sm text-indigo-600">Explore the latest trends</p>
                <button className="mt-3 bg-indigo-600 text-white text-xs px-4 py-2 rounded-full hover:bg-indigo-700">Shop Now</button>
              </div>
              <img src="https://images.unsplash.com/photo-1542291026-78fe2e6c1752?q=80&w=150&auto-format&fit=crop" alt="New Season" className="absolute right-0 bottom-0 h-full object-cover opacity-30" />
            </div>
            <div className="relative bg-gradient-to-br from-red-100 to-orange-100 p-6 rounded-xl shadow-md overflow-hidden min-h-[120px] flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-red-800 mb-1">Limited Time Sale</h3>
                <p className="text-sm text-red-600">Up to 50% Off selected items</p>
                <button className="mt-3 bg-red-600 text-white text-xs px-4 py-2 rounded-full hover:bg-red-700">View Deals</button>
              </div>
              <img src="https://images.unsplash.com/photo-1571902960683-11a37c38520f?q=80&w=150&auto-format&fit=crop" alt="Sale" className="absolute right-0 bottom-0 h-full object-cover opacity-30" />
            </div>
          </div>
        </div>

        {/* Trending Products (adapted from "Blockbuster Deals") */}
        <div className="px-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Trending Products</h2>
          <div className="flex space-x-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
            {mobileFeaturedProducts.map((item) => (
              <FashionProductCard
                key={item.id}
                id={item.id}
                title={item.title}
                price={item.price}
                imageUrl={item.imageUrl}
                onAddClick={() => console.log(`Add ${item.title} to cart`)} // Replace with actual cart logic
              />
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg flex justify-around items-center h-16 z-50">
          {[
            { 
              name: 'Home', 
              icon: <Home className="w-5 h-5" strokeWidth={2} />, 
              path: '/',
              active: location.pathname === '/'
            },
            { 
              name: 'Categories', 
              icon: <ShoppingBag className="w-5 h-5" strokeWidth={2} />, 
              path: '/categories',
              active: location.pathname === '/categories'
            },
            { 
              name: 'Wishlist', 
              icon: <Heart className="w-5 h-5" strokeWidth={2} fill="none" />, 
              path: '/wishlist',
              active: location.pathname === '/wishlist'
            },
            { 
              name: 'Cart', 
              icon: <ShoppingCart className="w-5 h-5" strokeWidth={2} />, 
              path: '/cart',
              active: location.pathname === '/cart'
            },
            { 
              name: 'Profile', 
              icon: <User className="w-5 h-5" strokeWidth={2} />, 
              path: '/profile',
              active: location.pathname === '/profile'
            },
          ].map((navItem) => (
            <Link
              key={navItem.name}
              to={navItem.path}
              className={`flex flex-col items-center text-xs font-medium transition-colors ${
                navItem.active 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <span className="flex items-center justify-center w-8 h-8 mb-1">
                {navItem.icon}
              </span>
              {navItem.name}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // --- Desktop Layout ---
  return (
    <section className="relative bg-gradient-to-b from-navy-900 to-navy-800 overflow-hidden">
      
      
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 md:py-24 lg:py-0">
          {/* Left content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Discover Your <span className="text-gold-400">Perfect Style</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0">
              Explore our curated collection of premium fashion for every occasion. Quality meets style in every stitch.
            </p>
            
            {/* Search bar */}
            <div className="max-w-xl mx-auto lg:mx-0 mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full py-4 pl-5 pr-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
                />
                <button 
                  onClick={() => submitSearch()}
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-gold-500 hover:bg-gold-600 text-white rounded-full p-3 mr-1.5 transition-colors duration-200"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Categories */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              {['New Arrivals', 'Bestsellers', 'Mens', 'Womens'].map((category) => (
                <button
                  key={category}
                  onClick={() => goCategory(category)}
                  className="px-5 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-full hover:bg-white/10 transition-colors duration-200 text-sm font-medium"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Right side - Image */}
          <div className="hidden lg:block relative">
            <div className="relative">
              <div className="absolute -right-10 -top-10 w-64 h-64 bg-gold-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
              <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-navy-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto-format&fit=crop" 
                  alt="Fashion model" 
                  className="w-full max-w-xs lg:max-w-sm xl:max-w-md mx-auto rounded-2xl shadow-2xl duration-300"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 bg-gradient-to-r from-navy-900 to-navy-800 text-white rounded-t-[28px] sm:rounded-t-[48px] px-5 sm:px-8 py-8 sm:py-12 shadow-lg mt-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Premium Quality Materials</h2>
            <p className="text-navy-100 text-sm sm:text-base leading-relaxed max-w-2xl">
              Our collections are crafted with the finest materials, ensuring both luxury and durability. Experience the difference that exceptional craftsmanship makes.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-wrap gap-4 justify-end">
            <button className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors">
              Discover More
            </button>
            <button className="flex-1 sm:flex-none bg-gold-500 hover:bg-gold-600 text-navy-900 px-6 py-3 rounded-lg text-sm font-medium transition-colors">
              Shop Collection
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ElegantFashionHero;