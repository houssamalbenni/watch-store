import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { HiOutlineShoppingBag } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { addToCart } from '../store/slices/cartSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      addToCart({
        productId: product._id,
        title: product.title,
        price: product.price,
        discountPrice: product.discountPrice,
        image: product.images?.[0] || '',
        qty: 1,
      })
    );
    toast.success('Added to cart');
  };

  const handleWhatsApp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const msg = encodeURIComponent(`Hi, I'm interested in buying *${product.title}* ($${displayPrice.toLocaleString()}) from Sa3ati.\n\nProduct link: ${window.location.origin}/product/${product._id}`);
    window.open(`https://wa.me/96181391688?text=${msg}`, '_blank');
  };

  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/product/${product._id}`} className="group block">
        <div className="card-luxury overflow-hidden">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-luxury-dark">
            <img
              src={product.images?.[0] || 'https://via.placeholder.com/400x400?text=Sa3ati'}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500" />

            {/* Quick Buttons */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWhatsApp}
                className="bg-[#25D366] text-white p-3 hover:bg-[#1da851]"
              >
                <FaWhatsapp className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className="bg-luxury-gold text-luxury-black p-3 hover:bg-luxury-gold-light"
              >
                <HiOutlineShoppingBag className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.featured && (
                <span className="bg-luxury-gold text-luxury-black text-[10px] px-3 py-1 tracking-wider uppercase font-semibold">
                  Featured
                </span>
              )}
              {hasDiscount && (
                <span className="bg-red-600 text-white text-[10px] px-3 py-1 tracking-wider uppercase font-semibold">
                  Sale
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-5">
            <p className="text-luxury-gray text-xs tracking-[0.15em] uppercase mb-1">{product.brand}</p>
            <h3 className="text-luxury-white font-serif text-lg group-hover:text-luxury-gold transition-colors duration-300">
              {product.title}
            </h3>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-luxury-gold font-semibold text-lg">
                ${displayPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-luxury-gray line-through text-sm">
                  ${product.price.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
