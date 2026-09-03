import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Globe, MessagesSquare, Send } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-footer-bg text-footer-text pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-bold text-[#f3dcc0]">Perfect Pick</h2>
            <p className="text-[#f3dcc0]/80 max-w-xs leading-relaxed">
              Experience the finest collection of luxury bags, shoes, and jewelry in Nairobi. 
              Perfect Pick is dedicated to helping you find your perfect pick.
            </p>
            <div className="flex gap-4">
              <a href="https://perfectpick.co.ke" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Globe size={20} /></a>
              <a href="https://wa.me/254787251690" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><MessagesSquare size={20} /></a>
              <a href="https://instagram.com/perfectpick" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Send size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-serif font-semibold">Quick Links</h3>
            <ul className="space-y-4 text-[#f3dcc0]/80">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-primary transition-colors">Products</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">Our Story</Link></li>
              <li><Link to="/profile" className="hover:text-primary transition-colors">My Account</Link></li>
              <li><Link to="/wishlist" className="hover:text-primary transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div className="space-y-6">
            <h3 className="text-xl font-serif font-semibold">Customer Care</h3>
            <ul className="space-y-4 text-[#f3dcc0]/80">
              <li><Link to="/shipping" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
              <li><Link to="/refund" className="hover:text-primary transition-colors">Refund & Returns</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-serif font-semibold">Contact Us</h3>
            <ul className="space-y-4 text-[#f3dcc0]/80">
              <li className="flex items-start gap-3">
                <MapPin className="text-primary mt-1" size={18} />
                <span>Nairobi Commercial Center, Floor 2, Nairobi, Kenya</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-primary" size={18} />
                <span>+254 787 251 690</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-primary" size={18} />
                <span>hello@perfectpick.co.ke</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="text-primary mt-1" size={18} />
                <span>Mon - Sat: 8:30 AM - 7:30 PM<br />Sun & Holidays: 10:30 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#f3dcc0]/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#f3dcc0]/60">
          <p>© {new Date().getFullYear()} Perfect Pick. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-[#f3dcc0] transition-colors">Privacy Policy</Link>
            <Link to="/about" className="hover:text-[#f3dcc0] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
