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
  LayoutDashboard 
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
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === link.href ? "text-primary" : "text-medium"
              )}
            >
              {link.name}
              {location.pathname === link.href && (
                <motion.div 
                  layoutId="nav-underline"
                  className="h-0.5 bg-primary rounded-full mt-0.5"
                />
              )}
            </Link>
          ))}
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
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.href}
                  className={cn(
                    "text-lg font-medium py-2",
                    location.pathname === link.href ? "text-primary" : "text-medium"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              {user && isAdmin && (
                <Link to="/admin" className="text-lg font-medium py-2 text-primary">
                  Dashboard
                </Link>
              )}
              {!user && (
                <Link to="/login" className="text-lg font-medium py-2">
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
