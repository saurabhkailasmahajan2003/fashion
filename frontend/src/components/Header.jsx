import React, { useEffect, useState, useRef } from 'react';
import api from '../api.js';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X, Heart, LogOut, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useUser } from '../context/UserContext.jsx';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { items } = useCart();
  const { productIds, products } = useWishlist();
  const { user, logout } = useUser();
  const cartItemsCount = items.reduce((sum, i) => sum + i.qty, 0);
  const wishlistCount = productIds.length;
  
  const [openCategory, setOpenCategory] = useState(null); // 'Mens' | 'Womens' | 'Kids' | null

  // FIX 3: Add ref for user menu
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside logic for Search AND User Menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close search
      if (isSearchOpen && searchRef.current && !searchRef.current.contains(event.target) && !event.target.closest('.search-button')) {
        setIsSearchOpen(false);
      }
      
      // FIX 3: Add handleClickOutside for user menu
      if (isUserMenuOpen && userMenuRef.current && !userMenuRef.current.contains(event.target) && !event.target.closest('.user-menu-button')) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen, isUserMenuOpen]); // Dependency array updated

  const navLinks = [
    { name: 'Shop', href: '/shop' },
    { name: 'New Arrivals', href: '/shop?new=true', isNew: true },
    { name: 'Mens', href: '/category/Mens', hasSub: true },
    { name: 'Womens', href: '/category/Womens', hasSub: true },
    { name: 'Kids', href: '/category/Kids', hasSub: true },
    { name: 'Sale', href: '/shop?sale=true', isSale: true }
  ];

  const subcategories = {
    Mens: [ 'Shirts', 'Jeans', 'Jackets', 'Shoes', 'Accessories' ],
    Womens: [ 'Dresses', 'Tops', 'Skirts', 'Bags', 'Jewelry' ],
    Kids: [ 'Boys', 'Girls', 'Baby' ]
  };

  // FIX 1: Removed all complex hover timer logic (openWithDelay, closeWithDelay, hoverTimerRef)
  // We will use a simple and reliable onClick toggle instead.

  const searchSuggestions = ['Summer Collection', 'Leather Bags', 'Silk Dresses', 'Evening Gowns', 'Accessories', 'New Arrivals'];
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const navigate = useNavigate();
  const navigateSearch = (q) => {
    setIsSearchOpen(false);
    if (!q) return;
    navigate(`/shop?keyword=${encodeURIComponent(q)}`);
  };

  // debounce search
  useEffect(() => {
    if (!searchQuery) {
      setSuggestions([]);
      return;
    }
    let mounted = true;
    setSuggestLoading(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/products', { params: { keyword: searchQuery, limit: 6 } });
        if (mounted) setSuggestions(data.products || []);
      } catch (e) {
        if (mounted) setSuggestions([]);
      } finally {
        if (mounted) setSuggestLoading(false);
      }
    }, 300);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const IconButton = ({ icon: Icon, label, onClick, className = '', badgeCount = 0 }) => (
    <button
      aria-label={label}
      onClick={onClick}
      className={`relative p-1.5 text-gray-700 hover:text-primary-600 transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-opacity-50 rounded-md hover:bg-primary-50 active:scale-95 ${className}`}
    >
      <Icon size={20} strokeWidth={1.75} />
      {badgeCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">{badgeCount}</span>
      )}
    </button>
  );

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-500 ease-in-out ${isScrolled ? 'shadow-lg border-b border-gray-100' : 'shadow-sm border-b border-gray-50'}`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center md:hidden"></div>
            <div className="flex-grow md:flex-grow-0 flex justify-center md:justify-start">
                  <Link to="/" className="text-3xl font-black tracking-tight text-gray-900 hover:text-primary-600 transition-colors duration-300 transform hover:scale-105 uppercase whitespace-nowrap">
                ETRO
                <span className="block w-4 h-0.5  mx-auto mt-1"></span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-2 mx-4 flex-grow justify-center">
              {navLinks.map((link) => (
                link.hasSub ? (
                  <div
                    key={link.name}
                    className="relative"
                    // FIX 1: Removed onMouseEnter and onMouseLeave
                  >
                    <button
                      type="button"
                      aria-haspopup="true"
                      aria-expanded={openCategory === link.name}
                      className="relative flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-primary-600 transition-colors duration-300 tracking-wide uppercase py-1.5 px-3 rounded-full border border-gray-200 bg-white hover:bg-primary-50"
                      // FIX 1: Kept simple onClick toggle
                      onClick={() => setOpenCategory((curr) => (curr === link.name ? null : link.name))}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpenCategory((curr) => (curr === link.name ? null : link.name)); }}
                    >
                      <span>{link.name}</span>
                      <ChevronDown size={14} className={`transition-transform ${openCategory === link.name ? 'rotate-180' : ''}`} />
                    </button>
                    {openCategory === link.name && (
                      <div
                        className="absolute left-0 mt-2 min-w-[220px] bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-40"
                        // FIX 1: Removed onMouseEnter and onMouseLeave
                      >
                        <Link
                          to={link.href}
                          className="block px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-t-2xl"
                          onClick={() => setOpenCategory(null)}
                        >View All {link.name}</Link>
                        <div className="my-1 border-t border-gray-100"></div>
                        {subcategories[link.name].map((s) => (
                          <Link
                            key={s}
                            to={`${link.href}?sub=${encodeURIComponent(s)}`}
                            className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setOpenCategory(null)}
                            role="menuitem"
                          >{s}</Link>
                        ))}
                      </div>
                    )}
                  </div>
                  ) : (
                  <Link key={link.name} to={link.href} className="relative text-xs font-semibold text-gray-700 hover:text-primary-600 transition-colors duration-300 tracking-wide uppercase py-1.5 px-3 rounded-full border border-gray-200 bg-white hover:bg-primary-50">
                    {link.name}
                    {link.isNew && <span className="absolute -top-2 -right-4 bg-green-500 text-white text-xs px-1 rounded">NEW</span>}
                    {link.isSale && <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-1 rounded">SALE</span>}
                  </Link>
                )
              ))}
              <div className="hidden md:flex items-center h-9 rounded-full border border-gray-200 bg-white pl-3 pr-2 w-56 focus-within:ring-2 focus-within:ring-primary-300">
                <Search size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigateSearch(searchQuery); }}
                  className="flex-1 bg-transparent text-xs text-gray-700 placeholder-gray-400 focus:outline-none"
                />
                <button onClick={() => navigateSearch(searchQuery)} className="px-2.5 py-1 text-[11px] rounded-full bg-gray-900 text-white hover:bg-gray-800">Go</button>
              </div>
            </nav>
            <div className="flex items-center space-x-1 md:space-x-3">
              <span className="md:hidden">
                {/* FIX 5: Make search icon a toggle */}
                <IconButton icon={Search} label="Search" onClick={() => setIsSearchOpen(v => !v)} className="search-button" />
              </span>
            {user ? (
              <>
                {/* Profile, Logout icons removed; use hamburger menu */}
              </>
            ) : (
                <>
                  <Link 
                    to="/login" 
                    className="hidden sm:inline-flex items-center btn btn-primary font-semibold shadow-md"
                  >
                    Sign In
                  </Link>
                  <Link to="/login" className="sm:hidden">
                    <IconButton icon={User} label="Login" />
                  </Link>
                </>
              )}
            {/* Wishlist icon removed; available in menu */}
              <Link to="/cart"><IconButton icon={ShoppingBag} label="Shopping Bag" badgeCount={cartItemsCount} /></Link>
              {/* Right-aligned hamburger buttons */}
              <button
                aria-label="Toggle Menu"
                className="md:hidden relative p-2 text-gray-700  transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-opacity-50 rounded-lg hover:bg-primary-50 active:scale-95"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
              </button>
              
              {/* FIX 3: Attach the ref to the user menu wrapper */}
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button
                  aria-label="Open Menu"
                  // Add class for click-outside logic to identify
                  className="user-menu-button relative p-2 text-gray-700  transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-opacity-50 rounded-full hover:bg-rose-50 active:scale-95 border border-gray-200 w-10 h-10 flex items-center justify-center"
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                >
                  {isUserMenuOpen ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-lg py-2 z-50">
                    {user ? (
                      <>
                        {user.isAdmin && (
                          <Link to="/admin" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Admin</Link>
                        )}
                        <Link to="/profile" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                        <Link to="/wishlist" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Wishlist <span className="ml-2 text-xs text-gray-500">({wishlistCount})</span></Link>
                        <button onClick={() => { setIsUserMenuOpen(false); logout(); navigate('/'); }} className="w-full text-left px-4 py-2 text-sm  hover:bg-red-50">Logout</button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Sign In</Link>
                        <Link to="/register" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Sign Up</Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {isSearchOpen && (
          <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md">
            <div ref={searchRef} className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl pt-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Search</h2>
                <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={24} className="text-gray-600" />
                </button>
              </div>
                <div className="relative mb-8">
                  <div className="rounded-full bg-white shadow-sm border border-gray-200 px-4 py-2 flex items-center">
                    <Search className="text-gray-400 mr-3 flex-shrink-0" size={20} />
                    <input
                      type="text"
                      aria-label="Search products"
                      placeholder="Search products, collections, brands..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') navigateSearch(searchQuery);
                      }}
                      className="flex-1 text-lg placeholder-gray-400 bg-transparent focus:outline-none"
                      autoFocus
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="ml-3 text-sm text-gray-500 hover:text-gray-700">Clear</button>
                    )}
                  </div>
                </div>
              {searchQuery === '' && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Popular Searches</h3>
                  <div className="flex flex-wrap gap-3">
                    {searchSuggestions.map((s, i) => (
                      <button key={i} onClick={() => setSearchQuery(s)} className="px-4 py-2 bg-gray-100 hover:bg-primary-50 text-gray-700 hover:text-primary-600 rounded-full transition-colors duration-200">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {searchQuery !== '' && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Results</h3>
                  <div className="bg-white rounded-lg shadow-md divide-y overflow-hidden">
                    {suggestLoading && (
                      <div className="p-4 text-sm text-gray-500">Searching...</div>
                    )}
                    {!suggestLoading && suggestions.length === 0 && (
                      <div className="p-4 text-sm text-gray-500">No results. Press Enter to search all products.</div>
                    )}
                    {!suggestLoading && suggestions.map((p) => (
                      <button key={p._id} onClick={() => navigateSearch(p.name)} className="w-full text-left p-3 hover:bg-gray-50 flex items-center gap-3">
                        <img src={p.image || p.images?.[0] || '/images/placeholder.png'} alt={p.name} className="w-12 h-12 object-cover rounded-md" />
                        <div>
                          <div className="font-medium text-gray-900">{p.name}</div>
                          <div className="text-sm text-gray-500">{p.brand} • ₹{p.price.toLocaleString()}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
                <button onClick={() => setIsSearchOpen(false)} className="px-6 py-3 bg-gray-900 text-white hover:bg-gray-800 rounded-full transition-colors duration-200">Close Search</button>
              </div>
            </div>
          </div>
        )}

        {/* FIX 2: This is the main transparency fix.
          Changed 'bg-white/98' to 'bg-white'
          Removed 'backdrop-blur-md'
        */}
        <div className={`md:hidden absolute top-full left-0 right-0 z-40 bg-white border-b border-gray-100 transition-all duration-500 ease-in-out overflow-hidden ${isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <nav className="flex flex-col items-stretch py-6 px-4 space-y-1">
            {navLinks.map((link) => (
                <Link key={link.name} to={link.href} className="flex items-center justify-between py-4 px-6 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300 ease-out rounded-lg font-medium text-lg" onClick={() => setIsMenuOpen(false)}>
              <span>{link.name}</span>
              {link.isNew && <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">NEW</span>}
              {link.isSale && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">SALE</span>}
            </Link>
            ))}
            <div className="border-t border-gray-100 mt-4 pt-4">
              <button onClick={() => { setIsMenuOpen(false); setIsSearchOpen(true); }} className="flex items-center w-full py-4 px-6 text-gray-700 hover:text-primary-600 transition-colors">
                <Search size={18} className="mr-3" />
                Search
              </button>
              {user ? (
                <>
                  <Link to="/profile" className="flex items-center py-4 px-6 text-gray-700 hover:text-primary-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <User size={18} className="mr-3" />
                    Profile
                  </Link>
                  <button onClick={() => { logout(); setIsMenuOpen(false); navigate('/'); }} className="flex items-center w-full py-4 px-6 text-gray-700 hover:text-primary-600 transition-colors">
                    <LogOut size={18} className="mr-3" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="px-2 pt-2 pb-4 space-y-2">
                  <Link 
                    to="/login" 
                    className="w-full btn btn-primary flex items-center justify-center" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="w-full btn btn-secondary flex items-center justify-center" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
              <div className="w-full px-2">
                <div className="w-full flex flex-col">
                  {/* FIX 4: Made this whole block a <Link>
                  */}
                  <Link 
                    to="/wishlist" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="w-full flex items-center py-4 px-6 text-gray-700 hover:text-primary-600 transition-colors rounded-lg"
                  >
                    <Heart size={18} className="mr-3" />
                    <span className="flex-1 text-left">Wishlist</span>
                    <span className="ml-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{wishlistCount}</span>
                  </Link>
                  {products && products.length > 0 ? (
                    <div className="px-6 pt-2 pb-4">
                      <div className="flex items-center gap-2 overflow-x-auto py-2">
                        {products.slice(0, 8).map((p) => (
                          <Link
                            to={`/product/${p._id || p.id}`}
                            key={p._id || p.id}
                            onClick={() => { setIsMenuOpen(false); }}
                            className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 rounded-md overflow-hidden border border-gray-100"
                          >
                            <img src={p.image || p.images?.[0] || '/images/placeholder.png'} alt={p.name} className="w-full h-full object-cover" />
                          </Link>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-between px-1">
                        <Link to="/wishlist" onClick={() => { setIsMenuOpen(false); }} className="text-sm text-primary-600 font-medium">View all</Link>
                        <Link to="/wishlist" onClick={() => { setIsMenuOpen(false); }} className="btn btn-primary text-sm">Open</Link>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* This is the page scroll progress bar */}
      <div
        className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-primary-400 to-primary-600 origin-left transition-transform duration-200 ease-out"
        style={{ transform: `scaleX(${typeof window !== 'undefined' ? (window.scrollY / Math.max(1, (document.body.scrollHeight - window.innerHeight))) : 0})` }}
      ></div>
    </>
  );
};

export default Header;