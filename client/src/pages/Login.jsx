import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { login, clearError } from '../store/slices/authSlice';
import Logo from '../components/Logo';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/control-panel' : '/');
  }, [user, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onSubmit = (data) => dispatch(login(data));

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6 bg-luxury-black">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            <Logo size="md" />
          </Link>
          <h1 className="text-3xl font-serif mt-8">Welcome Back</h1>
          <p className="text-luxury-gray text-sm mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm text-luxury-gray block mb-1">Email</label>
            <input
              {...register('email')}
              type="email"
              className="input-luxury"
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-sm text-luxury-gray block mb-1">Password</label>
            <input
              {...register('password')}
              type="password"
              className="input-luxury"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-8 text-luxury-gray text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-luxury-gold hover:text-luxury-gold-light transition-colors">
            Create Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
