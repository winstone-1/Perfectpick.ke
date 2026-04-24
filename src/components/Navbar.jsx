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

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const location = useLocation();

  const wishlistCount = wishlist.length;

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

const isAdmin = user?.isAdmin === true;

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'About', href: '/about' },
    { name: 'Shipping', href: '/shipping' },
    { name: 'Returns', href: '/refund' },
  ];

  return (
    <nav 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 border-b",
        scrolled ? "bg-bg/80 backdrop-blur-md shadow-sm border-border" : "bg-bg border-transparent"
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-2xl font-serif font-extrabold text-[#7a4d32] tracking-tight">
              Perfect Pick
            </span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link 
            to="/" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              location.pathname === '/' ? "text-primary" : "text-medium"
            )}
          >
            Home
          </Link>
          <Link 
            to="/new-arrivals" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1",
              location.pathname === '/new-arrivals' ? "text-primary" : "text-medium"
            )}
          >
            <Sparkles size={14} /> New Arrivals
          </Link>
          <Link 
            to="/trending" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1",
              location.pathname === '/trending' ? "text-primary" : "text-medium"
            )}
          >
            <Flame size={14} /> Trending
          </Link>
          <div className="relative group">
            <button className="text-sm font-medium text-medium hover:text-primary transition-colors flex items-center gap-1 cursor-default">
              Shop <ChevronDown size={14} />
            </button>
            <div className="absolute top-full left-0 w-40 bg-white shadow-xl rounded-xl py-2 hidden group-hover:block z-50 border border-border/10">
              <Link to="/products" className="block px-4 py-2 text-sm hover:bg-surface text-medium hover:text-primary">All Products</Link>
              <div className="h-px bg-border/10 my-1 mx-2" />
              <Link to="/products?category=Bags" className="block px-4 py-2 text-sm hover:bg-surface text-medium hover:text-primary">Bags</Link>
              <Link to="/products?category=Shoes" className="block px-4 py-2 text-sm hover:bg-surface text-medium hover:text-primary">Shoes</Link>
              <Link to="/products?category=Jewelry" className="block px-4 py-2 text-sm hover:bg-surface text-medium hover:text-primary">Jewelry</Link>
            </div>
          </div>
          <Link 
            to="/about" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              location.pathname === '/about' ? "text-primary" : "text-medium"
            )}
          >
            About
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="hidden sm:block">
                  <Button variant="ghost" size="icon" className="text-medium hover:text-primary">
                    <LayoutDashboard size={20} />
                  </Button>
                </Link>
              )}
              
              <Link to="/wishlist" className="relative group">
                <Button variant="ghost" size="icon" className="text-medium hover:text-primary">
                  <Heart size={20} className={wishlistCount > 0 ? "fill-red-500 text-red-500" : ""} />
                  <AnimatePresence>
                    {wishlistCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center"
                      >
                        {wishlistCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </Link>

              <Link to="/cart" className="relative group">
                <Button variant="ghost" size="icon" className="text-medium hover:text-primary">
                  <ShoppingBag size={20} />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 bg-[#7a4d32] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </Link>

              <Link to="/profile">
                <Button variant="ghost" size="icon" className="text-medium hover:text-primary">
                  <User size={20} />
                </Button>
              </Link>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={logout}
                className="text-medium hover:text-primary"
              >
                <LogOut size={20} />
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" className="text-medium hidden sm:flex">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="btn-primary">Register</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-medium"
            onClick={() => setIsOpen(!isOpen)}
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
            className="md:hidden bg-bg border-t overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-4">
              <Link to="/" className="py-2 text-base hover:text-primary font-medium" onClick={() => setIsOpen(false)}>Home</Link>
              <Link to="/new-arrivals" className="py-2 text-base hover:text-primary font-medium flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <Sparkles size={16} /> New Arrivals
              </Link>
              <Link to="/trending" className="py-2 text-base hover:text-primary font-medium flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <Flame size={16} /> Trending
              </Link>
              
              <div className="pl-4 border-l-2 border-border/10 space-y-2">
                <p className="text-xs uppercase text-muted-foreground font-black tracking-widest mb-2">Shop Categories</p>
                <Link to="/products" className="block py-2 text-base hover:text-primary" onClick={() => setIsOpen(false)}>All Collections</Link>
                <Link to="/products?category=Bags" className="block py-2 text-base hover:text-primary" onClick={() => setIsOpen(false)}>Bags</Link>
                <Link to="/products?category=Shoes" className="block py-2 text-base hover:text-primary" onClick={() => setIsOpen(false)}>Shoes</Link>
                <Link to="/products?category=Jewelry" className="block py-2 text-base hover:text-primary" onClick={() => setIsOpen(false)}>Jewelry</Link>
              </div>

              <Link to="/about" className="py-2 text-base hover:text-primary font-medium" onClick={() => setIsOpen(false)}>About</Link>
              
              <div className="h-px bg-border/10 my-2" />
              
              {user && isAdmin && (
                <Link to="/admin" className="text-lg font-medium py-2 text-primary flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <LayoutDashboard size={20} /> Dashboard
                </Link>
              )}
              {!user && (
                <Link to="/login" className="text-lg font-medium py-2" onClick={() => setIsOpen(false)}>
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
