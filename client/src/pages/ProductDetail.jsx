import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiOutlineShoppingBag, HiMinus, HiPlus, HiArrowLeft } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { fetchProductById, fetchProducts, clearCurrentProduct } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import ProductCard from '../components/ProductCard';
import Skeleton from '../components/Skeleton';
import { useLinkClickTracking } from '../hooks/useLinkClickTracking';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentProduct: product, loading, items: relatedProducts } = useSelector((s) => s.products);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const { trackLinkClick } = useLinkClickTracking();

  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => dispatch(clearCurrentProduct());
  }, [id, dispatch]);

  // Fetch related products
  useEffect(() => {
    if (product?.brand) {
      dispatch(fetchProducts({ brand: product.brand, limit: 4 }));
    }
  }, [product, dispatch]);

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(
      addToCart({
        productId: product._id,
        title: product.title,
        price: product.price,
        discountPrice: product.discountPrice,
        image: product.images?.[0] || '',
        qty,
      })
    );
    toast.success(`${product.title} added to cart`);
  };

  if (loading || !product) {
    return (
      <div className="pt-8 pb-16 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <Skeleton className="aspect-square" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const specs = product.specifications || {};

  return (
    <div className="pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back Link */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-luxury-gray hover:text-luxury-gold text-sm mb-8 transition-colors"
        >
          <HiArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Gallery */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="aspect-square overflow-hidden bg-luxury-dark">
              <img
                src={product.images?.[selectedImage] || 'https://via.placeholder.com/800x800?text=Sa3ati'}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3 mt-4">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 overflow-hidden border-2 transition-colors ${
                      i === selectedImage ? 'border-luxury-gold' : 'border-luxury-gray-dark hover:border-luxury-gray'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
            <p className="text-luxury-gold text-sm tracking-[0.2em] uppercase">{product.brand}</p>
            <h1 className="text-3xl md:text-4xl font-serif mt-2">{product.title}</h1>

            {/* Price */}
            <div className="mt-6 flex items-center gap-4">
              <span className="text-3xl text-luxury-gold font-semibold">
                ${displayPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-luxury-gray line-through text-xl">
                  ${product.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="mt-6 text-luxury-gray leading-relaxed">{product.description}</p>

            {/* Stock Status */}
            {product.stock === 0 && (
              <div className="mt-4 px-4 py-2 bg-red-600/20 border border-red-600 rounded text-red-500 text-sm">
                This product is currently out of stock
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border border-luxury-gray-dark">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 py-3 text-luxury-gray hover:text-luxury-gold transition-colors disabled:opacity-50"
                  disabled={product.stock === 0}
                >
                  <HiMinus className="w-4 h-4" />
                </button>
                <span className="px-6 py-3 text-center min-w-[60px]">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="px-4 py-3 text-luxury-gray hover:text-luxury-gold transition-colors disabled:opacity-50"
                  disabled={product.stock === 0}
                >
                  <HiPlus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn-primary flex-1 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiOutlineShoppingBag className="w-5 h-5" />
                Add to Cart
              </button>
            </div>

            {/* WhatsApp Buy Button */}
            <button
              onClick={async () => {
                // Track the click
                await trackLinkClick('whatsapp', product._id, `https://wa.me/96181391688`);
                // Open WhatsApp
                window.open(
                  `https://wa.me/96181391688?text=${encodeURIComponent(`Hi, I'm interested in buying *${product.title}* ($${displayPrice.toLocaleString()}) from Sa3ati.\n\nProduct link: ${window.location.href}`)}`,
                  '_blank'
                );
              }}
              className="mt-4 flex items-center justify-center gap-3 py-3 px-6 bg-[#25D366] text-white font-semibold text-sm tracking-wider hover:bg-[#1da851] transition-colors"
            >
              <FaWhatsapp className="w-5 h-5" />
              Buy via WhatsApp
            </button>

            {/* Specs */}
            <div className="mt-10 border-t border-luxury-gray-dark/30 pt-8">
              <h3 className="text-lg font-serif mb-4">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries({
                  'Case Size': specs.caseSize,
                  'Case Material': specs.caseMaterial,
                  'Strap': specs.strapMaterial,
                  'Strap Color': specs.strapColor,
                  'Movement': specs.movement,
                  'Water Resistance': specs.waterResistance,
                  'Dial Color': specs.dialColor,
                  'Gender': specs.gender,
                })
                  .filter(([, v]) => v)
                  .map(([label, value]) => (
                    <div key={label}>
                      <p className="text-luxury-gray text-xs tracking-wider uppercase">{label}</p>
                      <p className="text-luxury-white text-sm mt-1 capitalize">{value}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-3 py-1 border border-luxury-gray-dark text-luxury-gray tracking-wider uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 1 && (
          <section className="mt-24">
            <h2 className="text-3xl font-serif mb-10">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts
                .filter((p) => p._id !== product._id)
                .slice(0, 4)
                .map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
