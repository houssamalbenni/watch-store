import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './store/slices/authSlice';
import axios from 'axios';

// Meta Pixel Hooks
import { useInitializeMetaPixel, useTrackPageView } from './hooks/useMetaPixel';
import { usePageTracking } from './hooks/usePageTracking';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Layout — always loaded
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import LoadingScreen from './components/ProtectedRoute';

// Critical pages — loaded immediately
import Home from './pages/Home';
import Shop from './pages/Shop';

// Lazy-loaded pages — only fetched when navigated to
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));

// Admin pages — lazy loaded (only admins need these)
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminLinkClicks = lazy(() => import('./pages/admin/AdminLinkClicks'));

// Minimal fallback for lazy chunks
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => {
  const dispatch = useDispatch();
  const { initialized } = useSelector((s) => s.auth);
  const location = useLocation();

  // Initialize Meta Pixel on app load
  useInitializeMetaPixel();

  // Track page views on route change
  useTrackPageView();

  // Track all page visits for analytics
  usePageTracking();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      dispatch(fetchMe());
    } else {
      // Mark as initialized even without token
      dispatch({ type: 'auth/fetchMe/rejected' });
    }

    // Ping backend health endpoint to warm up Render (prevents cold starts)
    axios.get(`${API_URL}/health`).catch(() => {});
  }, [dispatch]);

  // Scroll to top on route change (including query params like pagination)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  if (!initialized) return <LoadingScreen />;

  const isAdmin = location.pathname.startsWith('/control-panel');

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdmin && <Navbar />}
      <main className={`flex-1 ${!isAdmin ? 'pt-[72px]' : ''}`}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected */}
            <Route
              path="/checkout"
              element={<ProtectedRoute><Checkout /></ProtectedRoute>}
            />
            <Route
              path="/profile"
              element={<ProtectedRoute><Profile /></ProtectedRoute>}
            />

            {/* Admin */}
            <Route
              path="/control-panel"
              element={<AdminRoute><AdminLayout /></AdminRoute>}
            >
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductForm />} />
              <Route path="products/edit/:id" element={<AdminProductForm />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="link-clicks" element={<AdminLinkClicks />} />
            </Route>
          </Routes>
        </Suspense>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
};

export default App;
