import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { register as registerUser, clearError } from '../store/slices/authSlice';
import Logo from '../components/Logo';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onSubmit = ({ name, email, password }) => {
    dispatch(registerUser({ name, email, password }));
  };

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
          <h1 className="text-3xl font-serif mt-8">Create Account</h1>
          <p className="text-luxury-gray text-sm mt-2">Join the Sa3ati experience</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm text-luxury-gray block mb-1">Full Name</label>
            <input {...register('name')} className="input-luxury" placeholder="John Doe" />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-sm text-luxury-gray block mb-1">Email</label>
            <input {...register('email')} type="email" className="input-luxury" placeholder="your@email.com" />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-sm text-luxury-gray block mb-1">Password</label>
            <input {...register('password')} type="password" className="input-luxury" placeholder="Min 8 characters" />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="text-sm text-luxury-gray block mb-1">Confirm Password</label>
            <input {...register('confirmPassword')} type="password" className="input-luxury" placeholder="••••••••" />
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-8 text-luxury-gray text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-luxury-gold hover:text-luxury-gold-light transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
