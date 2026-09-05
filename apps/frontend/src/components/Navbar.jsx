import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard,
  Sparkles,
  Flame,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import api from '../api/axios';
import DarkModeToggle from './DarkModeToggle';

// Resolve brand logo from assets automatically.
// Drop logo.jpg (or .png/.webp) into src/assets/ and rebuild to activate.
const logoModules = import.meta.glob('../assets/logo.{jpg,jpeg,png,webp}', { eager: true });
const logoEntry   = Object.values(logoModules)[0];
const logoSrc     = logoEntry?.default ?? null;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const accountRef = React.useRef(null);

  const wishlistCount = wishlist.length;

useEffect(() => {
    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/products/category-groups');
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                const flat = data.data.flatMap(g => g.categories);
                setCategories(flat);
            } else {
                setCategories(['bags', 'shoes', 'jewelry', 'gifts', 'accessories', 'clothes']);
            }
        } catch (error) {
            setCategories(['bags', 'shoes', 'jewelry', 'gifts', 'accessories', 'clothes']);
        }
    };
    fetchCategories();
}, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setAccountOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const isAdmin = user?.isAdmin === true || user?.role === 'admin' || user?.role === 'manager';

  return (
    <nav 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 border-b",
        scrolled 
          ? "bg-bg/95 dark:bg-stone-900/95 backdrop-blur-md shadow-sm border-border/80 dark:border-stone-800" 
          : "bg-bg/80 dark:bg-stone-900/80 backdrop-blur-sm border-transparent"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0" aria-label="Perfect Pick — home">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2"
          >
            {logoSrc && (
              <img
                src={logoSrc}
                alt="Perfect Pick logo"
                className="h-9 w-9 rounded-full object-cover border border-primary/20 shadow-sm group-hover:ring-2 group-hover:ring-primary/40 transition-all"
              />
            )}
            <span className="text-xl sm:text-2xl font-serif font-black text-dark dark:text-[#faf7f4] tracking-tight group-hover:text-primary transition-colors leading-none">
              Perfect Pick
            </span>
            {!logoSrc && <span className="w-2 h-2 rounded-full bg-primary inline-block" />}
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link 
            to="/" 
            className={cn(
              "text-sm font-bold transition-colors hover:text-primary dark:hover:text-primary",
              location.pathname === '/' ? "text-primary" : "text-medium dark:text-stone-200"
            )}
          >
            Home
          </Link>
          <Link 
            to="/new-arrivals" 
            className={cn(
              "text-sm font-bold transition-colors hover:text-primary dark:hover:text-primary flex items-center gap-1.5",
              location.pathname === '/new-arrivals' ? "text-primary" : "text-medium dark:text-stone-200"
            )}
          >
            <Sparkles size={14} className="text-primary" /> New Arrivals
          </Link>
          <Link 
            to="/trending" 
            className={cn(
              "text-sm font-bold transition-colors hover:text-primary dark:hover:text-primary flex items-center gap-1.5",
              location.pathname === '/trending' ? "text-primary" : "text-medium dark:text-stone-200"
            )}
          >
            <Flame size={14} className="text-amber-500" /> Trending
          </Link>

          {/* Shop Dropdown */}
          <div className="relative group">
            <button className="text-sm font-bold text-medium dark:text-stone-200 hover:text-primary dark:hover:text-primary transition-colors flex items-center gap-1 cursor-pointer py-2">
              Shop <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
            </button>
            <div className="absolute top-full left-0 w-52 bg-card dark:bg-stone-900 shadow-2xl rounded-2xl py-2 hidden group-hover:block z-50 border border-stone-200/80 dark:border-stone-800">
              <Link 
                to="/products" 
                className="block px-4 py-2.5 text-sm font-bold text-dark dark:text-stone-100 hover:bg-surface dark:hover:bg-stone-800/80 hover:text-primary dark:hover:text-primary transition-colors"
              >
                All Collections
              </Link>
              <div className="h-px bg-border/40 dark:bg-stone-800 my-1 mx-2" />
              {categories.map((cat) => (
                <Link 
                  key={cat} 
                  to={`/products?category=${cat.toLowerCase()}`} 
                  className="block px-4 py-2 text-sm font-medium text-medium dark:text-stone-300 hover:bg-surface dark:hover:bg-stone-800/80 hover:text-primary dark:hover:text-primary capitalize transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Support Dropdown */}
          <div className="relative group">
            <button className="text-sm font-bold text-medium dark:text-stone-200 hover:text-primary dark:hover:text-primary transition-colors flex items-center gap-1 cursor-pointer py-2">
              Support <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
            </button>
            <div className="absolute top-full left-0 w-52 bg-card dark:bg-stone-900 shadow-2xl rounded-2xl py-2 hidden group-hover:block z-50 border border-stone-200/80 dark:border-stone-800">
              <Link to="/shipping" className="block px-4 py-2 text-sm font-medium text-medium dark:text-stone-300 hover:bg-surface dark:hover:bg-stone-800/80 hover:text-primary dark:hover:text-primary transition-colors">Shipping & Delivery</Link>
              <Link to="/refund" className="block px-4 py-2 text-sm font-medium text-medium dark:text-stone-300 hover:bg-surface dark:hover:bg-stone-800/80 hover:text-primary dark:hover:text-primary transition-colors">Refunds & Returns</Link>
              <Link to="/about" className="block px-4 py-2 text-sm font-medium text-medium dark:text-stone-300 hover:bg-surface dark:hover:bg-stone-800/80 hover:text-primary dark:hover:text-primary transition-colors">Contact & Story</Link>
              <a href="https://wa.me/254787251690" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-stone-800/80 transition-colors">WhatsApp Support</a>
            </div>
          </div>

          <Link 
            to="/about" 
            className={cn(
              "text-sm font-bold transition-colors hover:text-primary dark:hover:text-primary",
              location.pathname === '/about' ? "text-primary" : "text-medium dark:text-stone-200"
            )}
          >
            About
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-3">
          <DarkModeToggle />
          
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="hidden sm:block" title="Admin Dashboard">
                  <Button variant="ghost" size="icon" className="text-medium dark:text-stone-200 hover:text-primary dark:hover:text-primary hover:bg-surface dark:hover:bg-stone-800">
                    <LayoutDashboard size={20} />
                  </Button>
                </Link>
              )}
              
              <Link to="/wishlist" className="relative group" title="Wishlist">
                <Button variant="ghost" size="icon" className="text-medium dark:text-stone-200 hover:text-primary dark:hover:text-primary hover:bg-surface dark:hover:bg-stone-800">
                  <Heart size={20} className={wishlistCount > 0 ? "fill-red-500 text-red-500" : ""} />
                  <AnimatePresence>
                    {wishlistCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm"
                      >
                        {wishlistCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </Link>

              <Link to="/cart" className="relative group" title="Shopping Bag">
                <Button variant="ghost" size="icon" className="text-medium dark:text-stone-200 hover:text-primary dark:hover:text-primary hover:bg-surface dark:hover:bg-stone-800">
                  <ShoppingBag size={20} />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </Link>

              <div className="relative hidden sm:block" ref={accountRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAccountOpen(!accountOpen)}
                  aria-label="Account menu"
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  className="text-medium dark:text-stone-200 hover:text-primary dark:hover:text-primary hover:bg-surface dark:hover:bg-stone-800"
                >
                  <User size={20} />
                </Button>
                {accountOpen && (
                  <div
                    role="menu"
                    aria-label="Account menu"
                    className="absolute right-0 top-full mt-2 w-60 bg-card dark:bg-stone-900 shadow-2xl rounded-2xl py-2 z-50 border border-stone-200/80 dark:border-stone-800"
                  >
                    <div className="px-4 py-3 border-b border-border/40 dark:border-stone-800">
                      <p className="text-sm font-bold text-dark dark:text-stone-100 truncate">{user?.name || 'Account'}</p>
                      <p className="text-xs text-muted-foreground dark:text-stone-400 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      role="menuitem"
                      tabIndex={0}
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-dark dark:text-stone-200 hover:bg-surface dark:hover:bg-stone-800 hover:text-primary dark:hover:text-primary transition-colors"
                    >
                      <User size={16} /> Profile
                    </Link>
                    <Link
                      to="/orders"
                      role="menuitem"
                      tabIndex={0}
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-dark dark:text-stone-200 hover:bg-surface dark:hover:bg-stone-800 hover:text-primary dark:hover:text-primary transition-colors"
                    >
                      <ShoppingBag size={16} /> Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      role="menuitem"
                      tabIndex={0}
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-dark dark:text-stone-200 hover:bg-surface dark:hover:bg-stone-800 hover:text-primary dark:hover:text-primary transition-colors"
                    >
                      <Heart size={16} /> Wishlist
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        role="menuitem"
                        tabIndex={0}
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-dark dark:text-stone-200 hover:bg-surface dark:hover:bg-stone-800 hover:text-primary dark:hover:text-primary transition-colors"
                      >
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                    )}
                    <div className="h-px bg-border/40 dark:bg-stone-800 my-1 mx-2" />
                    <button
                      role="menuitem"
                      tabIndex={0}
                      onClick={() => { setAccountOpen(false); logout(); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                    >
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile account button - also moved to dropdown, keep icon for small screens but hidden on sm+ is above */}
              <Link to="/profile" title="Account" className="sm:hidden">
                <Button variant="ghost" size="icon" className="text-medium dark:text-stone-200 hover:text-primary dark:hover:text-primary hover:bg-surface dark:hover:bg-stone-800">
                  <User size={20} />
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" className="text-medium dark:text-stone-200 hover:text-primary hidden sm:flex text-sm font-bold">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="btn-primary text-xs sm:text-sm px-4 py-2">
                  Register
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-medium dark:text-stone-200"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-card dark:bg-stone-900 border-t border-border/40 dark:border-stone-800 overflow-hidden shadow-2xl"
          >
            <div className="flex flex-col p-5 gap-3">
              <Link to="/" className="py-2 text-base font-bold text-dark dark:text-stone-100 hover:text-primary" onClick={() => setIsOpen(false)}>
                Home
              </Link>
              <Link to="/new-arrivals" className="py-2 text-base font-bold text-dark dark:text-stone-100 hover:text-primary flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <Sparkles size={16} className="text-primary" /> New Arrivals
              </Link>
              <Link to="/trending" className="py-2 text-base font-bold text-dark dark:text-stone-100 hover:text-primary flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <Flame size={16} className="text-amber-500" /> Trending
              </Link>
              
              <div className="pl-3 border-l-2 border-primary/30 space-y-1.5 my-1">
                <p className="text-[10px] uppercase text-primary font-black tracking-widest mb-1.5">Shop Categories</p>
                <Link to="/products" className="block py-1.5 text-sm font-bold text-dark dark:text-stone-200 hover:text-primary" onClick={() => setIsOpen(false)}>
                  All Collections
                </Link>
                {categories.map(cat => (
                  <Link 
                    key={cat} 
                    to={`/products?category=${cat.toLowerCase()}`} 
                    className="block py-1 text-sm text-medium dark:text-stone-300 hover:text-primary capitalize" 
                    onClick={() => setIsOpen(false)}
                  >
                    {cat}
                  </Link>
                ))}
              </div>

              <div className="pl-3 border-l-2 border-stone-300 dark:border-stone-700 space-y-1.5 my-1">
                <p className="text-[10px] uppercase text-muted-foreground font-black tracking-widest mb-1.5">Customer Support</p>
                <Link to="/shipping" className="block py-1 text-sm text-medium dark:text-stone-300 hover:text-primary" onClick={() => setIsOpen(false)}>Shipping & Delivery</Link>
                <Link to="/refund" className="block py-1 text-sm text-medium dark:text-stone-300 hover:text-primary" onClick={() => setIsOpen(false)}>Refund & Returns</Link>
                <a href="https://wa.me/254787251690" target="_blank" rel="noopener noreferrer" className="block py-1 text-sm text-emerald-600 dark:text-emerald-400 font-bold" onClick={() => setIsOpen(false)}>
                  WhatsApp: +254 787 251 690
                </a>
              </div>

              <Link to="/about" className="py-2 text-base font-bold text-dark dark:text-stone-100 hover:text-primary" onClick={() => setIsOpen(false)}>
                About Us
              </Link>
              
              <div className="h-px bg-border/40 dark:bg-stone-800 my-2" />
              
              {user && isAdmin && (
                <Link to="/admin" className="text-base font-bold py-2 text-primary flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <LayoutDashboard size={18} /> Admin Dashboard
                </Link>
              )}
              {user && (
                <div className="pt-3 mt-3 border-t border-border/40 dark:border-stone-800">
                  <button
                    onClick={() => { setIsOpen(false); logout(); }}
                    className="w-full flex items-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                    aria-label="Sign out"
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                  <p className="text-[10px] text-muted-foreground dark:text-stone-500 mt-1 px-3 truncate">Signed in as {user?.email}</p>
                </div>
              )}
              {!user && (
                <div className="flex gap-3 pt-2">
                  <Link to="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full btn-outline">Login</Button>
                  </Link>
                  <Link to="/register" className="flex-1" onClick={() => setIsOpen(false)}>
                    <Button className="w-full btn-primary">Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
