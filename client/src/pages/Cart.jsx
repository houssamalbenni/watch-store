import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { HiOutlineTrash, HiMinus, HiPlus, HiOutlineShoppingBag } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import { selectCartItems, selectCartTotal, removeFromCart, updateQty, clearCart } from '../store/slices/cartSlice';

const Cart = () => {
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const dispatch = useDispatch();

  if (items.length === 0) {
    return (
      <div className="pt-8 pb-16 min-h-screen flex flex-col items-center justify-center px-6">
        <HiOutlineShoppingBag className="w-20 h-20 text-luxury-gray-dark mb-6" />
        <h1 className="text-3xl font-serif mb-3">Your Cart is Empty</h1>
        <p className="text-luxury-gray mb-8">Discover our luxury collection and find your perfect timepiece.</p>
        <Link to="/shop" className="btn-primary">Browse Collection</Link>
      </div>
    );
  }

  const shipping = total >= 500 ? 0 : 3;
  const grandTotal = total + shipping;

  return (
    <div className="pt-8 pb-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-serif mb-10"
        >
          Shopping Cart
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item, i) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-luxury p-6 flex gap-6"
              >
                <Link to={`/product/${item.productId}`} className="w-24 h-24 flex-shrink-0 bg-luxury-dark overflow-hidden">
                  <img src={item.image || 'https://via.placeholder.com/100'} alt={item.title} className="w-full h-full object-cover" />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.productId}`} className="font-serif text-lg hover:text-luxury-gold transition-colors">
                    {item.title}
                  </Link>
                  <p className="text-luxury-gold mt-1">
                    ${(item.discountPrice || item.price).toLocaleString()}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-luxury-gray-dark">
                      <button
                        onClick={() => dispatch(updateQty({ productId: item.productId, qty: item.qty - 1 }))}
                        className="px-3 py-1.5 text-luxury-gray hover:text-luxury-gold"
                      >
                        <HiMinus className="w-3 h-3" />
                      </button>
                      <span className="px-4 py-1.5 text-sm">{item.qty}</span>
                      <button
                        onClick={() => dispatch(updateQty({ productId: item.productId, qty: item.qty + 1 }))}
                        className="px-3 py-1.5 text-luxury-gray hover:text-luxury-gold"
                      >
                        <HiPlus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => dispatch(removeFromCart(item.productId))}
                      className="text-luxury-gray hover:text-red-400 transition-colors"
                    >
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            <button
              onClick={() => dispatch(clearCart())}
              className="text-sm text-luxury-gray hover:text-red-400 transition-colors"
            >
              Clear Cart
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card-luxury p-8 sticky top-28">
              <h2 className="text-xl font-serif mb-6">Order Summary</h2>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-luxury-gray">Subtotal</span>
                  <span>${total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-luxury-gray">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-luxury-gray text-xs">
                    Free shipping on orders over $500
                  </p>
                )}
                <div className="border-t border-luxury-gray-dark pt-4 flex justify-between text-lg">
                  <span className="font-serif">Total</span>
                  <span className="text-luxury-gold font-semibold">${grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <a
                href={`https://wa.me/96181391688?text=${encodeURIComponent(
                  `Hello, I'd like to order:\n${items.map(item => `• ${item.title} x${item.qty} - $${((item.discountPrice || item.price) * item.qty).toLocaleString()}\n  ${window.location.origin}/product/${item.productId}`).join('\n')}\n\nTotal: $${grandTotal.toLocaleString()}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center mt-8 flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1fb855] text-white font-semibold py-3 px-6 transition-colors"
              >
                <FaWhatsapp className="w-5 h-5" />
                Buy via WhatsApp
              </a>

              <Link
                to="/shop"
                className="block text-center mt-4 text-sm text-luxury-gray hover:text-luxury-gold transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
