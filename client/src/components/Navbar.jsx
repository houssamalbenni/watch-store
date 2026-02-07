import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShoppingBag, HiOutlineUser, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import Logo from './Logo';
import { selectCartCount } from '../store/slices/cartSlice';
import { logout } from '../store/slices/authSlice';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const cartCount = useSelector(selectCartCount);
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setUserMenu(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Shop', to: '/shop' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled || mobileOpen ? 'bg-luxury-black/95 backdrop-blur-md shadow-lg shadow-black/20' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <Logo size="sm" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-luxury-white/80 hover:text-luxury-gold text-sm tracking-[0.2em] uppercase font-light transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-5">
          {/* Cart */}
          <Link to="/cart" className="relative group">
            <HiOutlineShoppingBag className="w-6 h-6 text-luxury-white/80 group-hover:text-luxury-gold transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-luxury-gold text-luxury-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User */}
          <div className="relative">
            <button
              onClick={() => (user ? setUserMenu(!userMenu) : navigate('/login'))}
              className="text-luxury-white/80 hover:text-luxury-gold transition-colors"
            >
              <HiOutlineUser className="w-6 h-6" />
            </button>

            <AnimatePresence>
              {userMenu && user && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-56 bg-luxury-card border border-luxury-gray-dark rounded-sm shadow-xl"
                >
                  <div className="px-4 py-3 border-b border-luxury-gray-dark">
                    <p className="text-sm font-medium text-luxury-white">{user.name}</p>
                    <p className="text-xs text-luxury-gray">{user.email}</p>
                  </div>
                  <div className="py-2">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenu(false)}
                      className="block px-4 py-2 text-sm text-luxury-white/80 hover:text-luxury-gold hover:bg-luxury-dark transition-colors"
                    >
                      My Profile
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/control-panel"
                        onClick={() => setUserMenu(false)}
                        className="block px-4 py-2 text-sm text-luxury-gold/80 hover:text-luxury-gold hover:bg-luxury-dark transition-colors"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-luxury-dark transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-luxury-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-luxury-black/98 border-t border-luxury-gray-dark overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-luxury-white/80 hover:text-luxury-gold text-lg tracking-wider"
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary text-center mt-2"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
