import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';
import { FaInstagram, FaTiktok, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const socials = [
    { name: 'WhatsApp', href: 'https://wa.me/254787251690', icon: FaWhatsapp, handle: '+254 787251690' },
    { name: 'Instagram', href: 'https://www.instagram.com/perfectpick.ke', icon: FaInstagram, handle: 'perfectpick.ke' },
    { name: 'TikTok', href: 'https://www.tiktok.com/@perfectpickke', icon: FaTiktok, handle: '@perfectpickke' },
    { name: 'X', href: 'https://x.com/perfectpickke', icon: FaXTwitter, handle: '@perfectpickke' },
    { name: 'Email', href: 'mailto:perfectpick26@gmail.com', icon: Mail, handle: 'perfectpick26@gmail.com' },
  ];

  return (
    <footer className="bg-footer-bg text-footer-text pt-16 pb-10 border-t border-white/10">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-serif font-black text-[#faf7f4] tracking-tight">Perfect Pick</h2>
              <p className="text-xs uppercase tracking-[0.25em] text-primary font-bold">{t('footer.brandTagline')}</p>
            </div>
            <p className="text-footer-text/85 text-sm leading-relaxed max-w-xs">
              {t('footer.brandDesc')}
            </p>
            {/* Social Icons */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  title={`${s.name}: ${s.handle}`}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary text-[#faf7f4] hover:text-white flex items-center justify-center transition-all duration-200 border border-white/10 hover:scale-105"
                >
                  <s.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-serif font-bold text-[#faf7f4] tracking-wide">{t('footer.collections')}</h3>
            <ul className="space-y-3.5 text-sm text-footer-text/85">
              <li><Link to="/products" className="hover:text-primary transition-colors">{t('footer.allProducts')}</Link></li>
              <li><Link to="/new-arrivals" className="hover:text-primary transition-colors">{t('footer.newArrivals')}</Link></li>
              <li><Link to="/trending" className="hover:text-primary transition-colors">{t('footer.trendingNow')}</Link></li>
              <li><Link to="/wishlist" className="hover:text-primary transition-colors">{t('footer.myWishlist')}</Link></li>
              <li><Link to="/profile" className="hover:text-primary transition-colors">{t('footer.myAccount')}</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-6">
            <h3 className="text-lg font-serif font-bold text-[#faf7f4] tracking-wide">{t('footer.customerCare')}</h3>
            <ul className="space-y-3.5 text-sm text-footer-text/85">
              <li><Link to="/shipping" className="hover:text-primary transition-colors">{t('footer.shippingPolicy')}</Link></li>
              <li><Link to="/refund" className="hover:text-primary transition-colors">{t('footer.refundPolicy')}</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">{t('footer.ourStory')}</Link></li>
              <li>
                <a href="https://wa.me/254787251690" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <span>{t('footer.whatsappSupport')}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-serif font-bold text-[#faf7f4] tracking-wide">{t('footer.contactUs')}</h3>
            <ul className="space-y-3.5 text-sm text-footer-text/85">
              <li className="flex items-start gap-3">
                <MapPin className="text-primary shrink-0 mt-0.5" size={17} />
                <a href="https://maps.google.com/?q=Amaziah+Square+Muthiga+Waiyaki+Way+Nairobi" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors leading-relaxed">Amaziah Square, Muthiga<br />Along Waiyaki Way, Nairobi</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-primary shrink-0" size={17} />
                <a href="tel:+254787251690" className="hover:text-primary transition-colors">+254 787 251 690</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-primary shrink-0" size={17} />
                <a href="mailto:perfectpick26@gmail.com" className="hover:text-primary transition-colors">perfectpick26@gmail.com</a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="text-primary shrink-0 mt-0.5" size={17} />
                <span>{t('footer.monSat')}<br />{t('footer.sunHolidays')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-footer-text/70">
          <p className="flex items-center gap-1">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-white transition-colors">{t('footer.privacyPolicy')}</Link>
            <Link to="/about" className="hover:text-white transition-colors">{t('footer.termsOfService')}</Link>
            <Link to="/shipping" className="hover:text-white transition-colors">{t('footer.deliveryRates')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
