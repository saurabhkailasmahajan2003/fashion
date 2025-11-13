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
  const [scrollProgress, setScrollProgress] = useState(0);

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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      
      // Calculate scroll progress
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);
    };
    
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
    { name: 'Latest', href: '/shop?new=true', isNew: true },
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
        className={`sticky top-0 z-50 bg-white border-b border-gray-100 transition-all duration-500 ease-in-out ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-20">
            {/* Logo - Aligned to the far left */}
            <div>
              <Link to="/" className="text-3xl font-black tracking-tight text-gray-900 hover:text-primary-600 transition-colors duration-300 transform hover:scale-105 uppercase whitespace-nowrap">
                ETRO
                <span className="block w-4 h-0.5 bg-gray-900 mt-1"></span>
              </Link>
            </div>
            
            {/* Navigation - Center aligned */}
            <nav className="hidden md:flex items-center gap-4 mx-8">
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
            <div className="flex items-center space-x-2 md:space-x-3">
              {/* Mobile Search Button */}
              <button 
                onClick={() => setIsSearchOpen(v => !v)} 
                className="md:hidden p-2 text-gray-700 hover:text-primary-600 focus:outline-none"
                aria-label="Search"
              >
                <Search size={20} strokeWidth={1.75} />
              </button>

              {/* Cart */}
              <Link 
                to="/cart" 
                className="relative p-2 text-gray-700 hover:text-primary-600 focus:outline-none"
                aria-label="Shopping Cart"
              >
                <ShoppingBag size={20} strokeWidth={1.75} />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              {/* User Menu (Desktop) */}
              {user ? (
                <div className="hidden md:block relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="p-2 text-gray-700 hover:text-primary-600 focus:outline-none"
                    aria-label="User Menu"
                  >
                    <User size={20} strokeWidth={1.75} />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100">
                      {user.isAdmin && (
                        <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Admin</Link>
                      )}
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                      <Link to="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Wishlist</Link>
                      <button 
                        onClick={() => { logout(); navigate('/'); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="hidden md:inline-flex items-center px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none whitespace-nowrap"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Button - Always show close button when menu is open */}
              <div className="flex items-center md:hidden">
                {isMenuOpen ? (
                  <button
                    aria-label="Close Menu"
                    className="p-1.5 text-gray-600 hover:text-gray-900 focus:outline-none transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <X size={20} strokeWidth={2} />
                  </button>
                ) : (
                  <button
                    aria-label="Open Menu"
                    className="p-1.5 text-gray-600 hover:text-gray-900 focus:outline-none transition-colors"
                    onClick={() => setIsMenuOpen(true)}
                  >
                    <Menu size={20} strokeWidth={2} />
                  </button>
                )}
              </div>
              
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
                        <Link to="/login" onClick={() => setIsUserMenuOpen(false)} className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded">Sign In</Link>
                        <Link to="/register" onClick={() => setIsUserMenuOpen(false)} className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded">Sign Up</Link>
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
        {/* Mobile Menu Overlay */}
        <div 
          className={`md:hidden fixed inset-0 z-50 bg-white transition-all duration-300 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ paddingTop: '4.5rem' }}
        >
          {/* Close button for mobile menu */}
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute right-4 top-4 p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
          {/* User Profile Section */}
          {user ? (
            <div className="border-b border-gray-100 px-4 py-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                  <User size={20} className="text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{user.name || 'My Account'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  <Link 
                    to="/profile" 
                    className="mt-1 inline-flex items-center text-xs font-medium text-primary-600 hover:text-primary-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    View Profile
                    <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <button 
                  onClick={() => { logout(); setIsMenuOpen(false); navigate('/'); }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  aria-label="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm text-gray-600 mb-2">Welcome! Sign in to your account</p>
              <div className="flex space-x-2">
                <Link 
                  to="/login" 
                  className="flex-1 text-center py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="flex-1 text-center py-2 text-sm font-medium bg-gray-900 text-white rounded hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
          
          <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
            {/* Main Navigation */}
            <div className="px-1 py-1">
              {navLinks.filter(link => !link.hasSub).map((link) => (
                <Link 
                  key={link.name} 
                  to={link.href} 
                  className="flex items-center justify-between py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{link.name}</span>
                  {link.isNew && <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full">NEW</span>}
                  {link.isSale && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">SALE</span>}
                </Link>
              ))}
            </div>

            {/* Account Section */}
            <div className="border-t border-gray-100 pt-2 mt-2">
              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    className="flex items-center justify-between py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>My Profile</span>
                    <User size={18} className="text-gray-400" />
                  </Link>
                  <Link 
                    to="/wishlist" 
                    className="flex items-center justify-between py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>Wishlist</span>
                    <div className="flex items-center">
                      {wishlistCount > 0 && (
                        <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2">
                          {wishlistCount}
                        </span>
                      )}
                      <Heart size={18} className="text-gray-400" />
                    </div>
                  </Link>
                  <button 
                    onClick={() => { logout(); setIsMenuOpen(false); navigate('/'); }} 
                    className="w-full text-left flex items-center justify-between py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    <span>Logout</span>
                    <LogOut size={18} className="text-gray-400" />
                  </button>
                </>
              ) : (
                <div className="px-1 space-y-1">
                  <Link 
                    to="/login"
                    className="block py-2 px-3 text-center text-sm font-medium text-primary-600 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In / Register
                  </Link>
                </div>
              )}
            </div>

            {/* Icons - Far right */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => { setIsMenuOpen(false); setIsSearchOpen(true); }} 
                className="p-2 text-gray-700 hover:text-primary-600 focus:outline-none"
                aria-label="Search products"
              >
                <Search size={20} className="text-gray-600" />
              </button>
              
              <Link 
                to="/cart" 
                className="relative p-2 text-gray-700 hover:text-primary-600 focus:outline-none"
                aria-label="Shopping Cart"
              >
                <ShoppingBag size={20} className="text-gray-600" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-700 hover:text-primary-600 focus:outline-none md:hidden"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </nav>
            </div>
          
      </header>
      {/* This is the page scroll progress bar */}
      <div
        className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-primary-400 to-primary-600 origin-left transition-transform duration-200 ease-out"
        style={{ transform: `scaleX(${scrollProgress}%)` }}
      ></div>
    </>
  );
};

export default Header;