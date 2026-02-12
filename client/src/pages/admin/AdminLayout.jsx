import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  HiOutlineChartBar,
  HiOutlineCube,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineArrowLeft,
  HiOutlineLogout,
} from 'react-icons/hi';
import Logo from '../../components/Logo';
import { logout } from '../../store/slices/authSlice';

const sidebarLinks = [
  { to: '/control-panel/dashboard', icon: HiOutlineChartBar, label: 'Dashboard' },
  { to: '/control-panel/products', icon: HiOutlineCube, label: 'Products' },
  { to: '/control-panel/orders', icon: HiOutlineClipboardList, label: 'Orders' },
  { to: '/control-panel/users', icon: HiOutlineUsers, label: 'Users' },
];

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-luxury-black">
      {/* Sidebar */}
      <aside className="w-64 bg-luxury-dark border-r border-luxury-gray-dark/30 flex flex-col fixed h-full">
        <div className="p-6 border-b border-luxury-gray-dark/30">
          <Logo size="sm" />
          <p className="text-luxury-gold text-[10px] tracking-[0.3em] uppercase mt-2">Admin Panel</p>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                  isActive
                    ? 'bg-luxury-gold/10 text-luxury-gold border-l-2 border-luxury-gold'
                    : 'text-luxury-gray hover:text-luxury-white hover:bg-luxury-card'
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-luxury-gray-dark/30 space-y-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-4 py-2 text-sm text-luxury-gray hover:text-luxury-white w-full transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back to Store
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 w-full transition-colors"
          >
            <HiOutlineLogout className="w-4 h-4" />
            Logout
          </button>
          <div className="px-4 py-2 text-xs text-luxury-gray">
            {user?.name} ({user?.email})
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
