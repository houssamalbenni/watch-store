import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { selectCartItems, selectCartTotal, clearCart } from '../store/slices/cartSlice';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(5, 'Phone is required'),
  street: z.string().min(3, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().min(2, 'Country is required'),
  paymentMethod: z.string().default('cod'),
});

const Checkout = () => {
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: 'cod', country: '' },
  });

  const shipping = total >= 500 ? 0 : 25;
  const grandTotal = total + shipping;

  const onSubmit = async (formData) => {
    if (items.length === 0) return;
    setSubmitting(true);

    try {
      const orderData = {
        items: items.map((i) => ({
          productId: i.productId,
          title: i.title,
          price: i.discountPrice || i.price,
          qty: i.qty,
          image: i.image,
        })),
        subtotal: total,
        shipping,
        total: grandTotal,
        paymentMethod: formData.paymentMethod,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state || '',
          zip: formData.zip || '',
          country: formData.country,
        },
      };

      await api.post('/orders', orderData);
      dispatch(clearCart());
      toast.success('Order placed successfully!');
      navigate('/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="pt-8 pb-16 min-h-screen">
      <div className="max-w-5xl mx-auto px-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-serif mb-10"
        >
          Checkout
        </motion.h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Shipping Form */}
            <div className="lg:col-span-2 space-y-8">
              <div className="card-luxury p-8">
                <h2 className="text-xl font-serif mb-6">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm text-luxury-gray block mb-1">Full Name</label>
                    <input {...register('fullName')} className="input-luxury" placeholder="John Doe" />
                    {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-luxury-gray block mb-1">Phone</label>
                    <input {...register('phone')} className="input-luxury" placeholder="+961 71 000 000" />
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-luxury-gray block mb-1">Country</label>
                    <input {...register('country')} className="input-luxury" placeholder="Lebanon" />
                    {errors.country && <p className="text-red-400 text-xs mt-1">{errors.country.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-luxury-gray block mb-1">Street Address</label>
                    <input {...register('street')} className="input-luxury" placeholder="123 Main St" />
                    {errors.street && <p className="text-red-400 text-xs mt-1">{errors.street.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-luxury-gray block mb-1">City</label>
                    <input {...register('city')} className="input-luxury" placeholder="Beirut" />
                    {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-luxury-gray block mb-1">State / Province</label>
                    <input {...register('state')} className="input-luxury" placeholder="Optional" />
                  </div>
                  <div>
                    <label className="text-sm text-luxury-gray block mb-1">ZIP Code</label>
                    <input {...register('zip')} className="input-luxury" placeholder="Optional" />
                  </div>
                </div>
              </div>

              <div className="card-luxury p-8">
                <h2 className="text-xl font-serif mb-6">Payment Method</h2>
                <label className="flex items-center gap-3 cursor-pointer p-4 border border-luxury-gold bg-luxury-dark">
                  <input type="radio" value="cod" {...register('paymentMethod')} defaultChecked className="accent-luxury-gold" />
                  <div>
                    <p className="text-sm font-medium">Cash on Delivery</p>
                    <p className="text-xs text-luxury-gray">Pay when you receive your order</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card-luxury p-8 sticky top-28">
                <h2 className="text-xl font-serif mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-3">
                      <div className="w-14 h-14 bg-luxury-dark flex-shrink-0 overflow-hidden">
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{item.title}</p>
                        <p className="text-xs text-luxury-gray">
                          {item.qty} x ${(item.discountPrice || item.price).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 text-sm border-t border-luxury-gray-dark pt-4">
                  <div className="flex justify-between">
                    <span className="text-luxury-gray">Subtotal</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-luxury-gray">Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `$${shipping}`}</span>
                  </div>
                  <div className="border-t border-luxury-gray-dark pt-3 flex justify-between text-lg">
                    <span className="font-serif">Total</span>
                    <span className="text-luxury-gold font-semibold">${grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full text-center mt-6 disabled:opacity-50"
                >
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
