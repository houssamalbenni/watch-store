import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-luxury-dark border-t border-luxury-gray-dark/30">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Logo size="sm" />
            <p className="mt-4 text-luxury-gray text-sm leading-relaxed">
              Crafting timeless elegance since 2025. Each Sa3ati timepiece is a masterwork of precision
              and luxury.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-luxury-gold text-sm tracking-[0.2em] uppercase mb-6">Explore</h4>
            <div className="flex flex-col gap-3">
              <Link to="/shop" className="text-luxury-gray hover:text-luxury-gold text-sm transition-colors">
                All Watches
              </Link>
              <Link to="/shop?featured=true" className="text-luxury-gray hover:text-luxury-gold text-sm transition-colors">
                Featured
              </Link>
              <Link to="/shop?gender=men" className="text-luxury-gray hover:text-luxury-gold text-sm transition-colors">
                Men's Collection
              </Link>
              <Link to="/shop?gender=women" className="text-luxury-gray hover:text-luxury-gold text-sm transition-colors">
                Women's Collection
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-luxury-gold text-sm tracking-[0.2em] uppercase mb-6">Company</h4>
            <div className="flex flex-col gap-3">
              <span className="text-luxury-gray text-sm">About Us</span>
              <span className="text-luxury-gray text-sm">Craftsmanship</span>
              <span className="text-luxury-gray text-sm">Warranty</span>
              <span className="text-luxury-gray text-sm">Shipping & Returns</span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-luxury-gold text-sm tracking-[0.2em] uppercase mb-6">Contact</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-luxury-gray text-sm">
                <HiOutlineMail className="w-4 h-4 text-luxury-gold" />
                info@sa3ati.com
              </div>
              <div className="flex items-center gap-3 text-luxury-gray text-sm">
                <HiOutlinePhone className="w-4 h-4 text-luxury-gold" />
                +961 81 391 688
              </div>
              <div className="flex items-center gap-3 text-luxury-gray text-sm">
                <HiOutlineLocationMarker className="w-4 h-4 text-luxury-gold" />
                Lebanon
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-luxury-gray-dark/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-luxury-gray text-xs tracking-wider">
            &copy; {new Date().getFullYear()} Sa3ati. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-luxury-gray text-xs hover:text-luxury-gold cursor-pointer transition-colors">
              Privacy Policy
            </span>
            <span className="text-luxury-gray text-xs hover:text-luxury-gold cursor-pointer transition-colors">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
