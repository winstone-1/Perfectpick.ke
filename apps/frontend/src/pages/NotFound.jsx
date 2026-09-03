import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Search } from 'lucide-react';
import { FaBagShopping } from 'react-icons/fa6';
import { Button } from '../components/ui/button';

const NotFound = () => {
  return (
    <div className="container mx-auto px-4 min-h-[70vh] flex flex-col items-center justify-center text-center space-y-12">
      <div className="relative group">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.05, scale: 1 }}
          transition={{ duration: 1 }}
          className="text-[15rem] md:text-[20rem] font-serif font-black text-[#c08050] leading-none select-none"
        >
          404
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="absolute inset-0 flex items-center justify-center text-9xl text-primary group-hover:scale-110 transition-transform duration-500"
        >
          <FaBagShopping />
        </motion.div>
      </div>

      <div className="space-y-4 max-w-md relative z-10">
        <h1 className="text-4xl font-serif font-black text-dark">Page Not Found</h1>
        <p className="text-medium leading-relaxed">
          The page you're looking for seems to have gone shopping! <br />
          Don't worry, we have plenty of other beautiful things to see.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
        <Link to="/">
          <Button variant="outline" className="btn-outline h-12 px-8 rounded-full flex gap-2">
            <ArrowLeft size={18} /> Go Home
          </Button>
        </Link>
        <Link to="/products">
          <Button className="btn-primary h-12 px-8 rounded-full flex gap-2">
            <Search size={18} /> Browse Products
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
