import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiArrowRight, HiOutlineStar, HiOutlineShieldCheck, HiOutlineTruck } from 'react-icons/hi';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';
import { fetchProducts } from '../store/slices/productSlice';

const Home = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 8 }));
  }, [dispatch]);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden -mt-[72px] pt-[72px]">
        {/* BG */}
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-black via-luxury-dark to-luxury-black" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-luxury-black/80" />

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-luxury-gold text-sm tracking-[0.4em] uppercase mb-6"
          >
            Luxury Timepieces
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight"
          >
            <span className="gold-gradient">Time</span> is the{' '}
            <br className="hidden sm:block" />
            ultimate <span className="gold-gradient">luxury</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-luxury-gray text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Discover our curated collection of exceptional timepieces, crafted for those
            who appreciate the art of precision and elegance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/shop" className="btn-primary flex items-center gap-3">
              Explore Collection
              <HiArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-luxury-gold to-transparent" />
        </motion.div>
      </section>

      {/* ── Categories ── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-luxury-gold text-sm tracking-[0.3em] uppercase mb-3">Collections</p>
            <h2 className="text-4xl md:text-5xl font-serif">Find Your Style</h2>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 md:gap-6">
            {[
              { title: "Men's Collection", query: 'gender=men', img: '/images/men.jpg' },
              { title: "Women's Collection", query: 'gender=women', img: '/images/women.jpg' },
            ].map((cat, i) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Link
                  to={`/shop?${cat.query}`}
                  className="group relative block aspect-[3/4] overflow-hidden"
                >
                  <img
                    src={cat.img}
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 className="text-2xl font-serif text-luxury-white group-hover:text-luxury-gold transition-colors">
                      {cat.title}
                    </h3>
                    <div className="mt-3 flex items-center gap-2 text-luxury-gold text-sm tracking-wider">
                      <span>Discover</span>
                      <HiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            {
              icon: HiOutlineStar,
              title: 'Premium Quality',
              desc: 'Every timepiece is crafted with the finest materials and Swiss precision.',
            },
            {
              icon: HiOutlineShieldCheck,
              title: 'Warranty',
              desc: 'Full manufacturer warranty with worldwide service support.',
            },
            {
              icon: HiOutlineTruck,
              title: '3$ Shipping across Lebanon',
              desc: 'Fast and reliable delivery to your doorstep, anywhere in Lebanon.',
            },
          ].map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="flex flex-col items-center"
            >
              <feat.icon className="w-10 h-10 text-luxury-gold mb-5" />
              <h3 className="text-xl font-serif mb-3">{feat.title}</h3>
              <p className="text-luxury-gray text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-6 bg-luxury-dark/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-luxury-gold text-sm tracking-[0.3em] uppercase mb-3">Testimonials</p>
            <h2 className="text-4xl md:text-5xl font-serif">What Our Clients Say</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Ahmad K.',
                text: 'The Royal Chronograph exceeded my expectations. The craftsmanship is truly exceptional — every detail speaks luxury.',
                rating: 5,
              },
              {
                name: 'Nour M.',
                text: "My Éternelle Rose is breathtaking. I've received so many compliments. Sa3ati delivers true elegance.",
                rating: 5,
              },
              {
                name: 'Hassan R.',
                text: 'Fast shipping, beautiful packaging, and the watch itself is a masterpiece. Will definitely buy again.',
                rating: 5,
              },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="card-luxury p-8"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <HiOutlineStar key={j} className="w-4 h-4 text-luxury-gold fill-luxury-gold" />
                  ))}
                </div>
                <p className="text-luxury-gray text-sm leading-relaxed italic">"{t.text}"</p>
                <p className="mt-6 text-luxury-gold text-sm font-semibold">{t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-serif mb-6">
            Your Next <span className="gold-gradient">Masterpiece</span> Awaits
          </h2>
          <p className="text-luxury-gray text-lg mb-10">
            Join thousands of discerning collectors who trust Sa3ati for their finest timepieces.
          </p>
          <Link to="/shop" className="btn-primary inline-flex items-center gap-3">
            Shop Now <HiArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>
    </>
  );
};

export default Home;
