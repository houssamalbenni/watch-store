import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineAdjustments, HiOutlineX } from 'react-icons/hi';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';
import { fetchProducts } from '../store/slices/productSlice';
import api from '../lib/api';
const SORT_OPTIONS = [
  { label: 'Newest', value: '-createdAt' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Name A-Z', value: 'title' },
];

const Shop = () => {
  const dispatch = useDispatch();
  const { items, loading, totalPages, page, total } = useSelector((s) => s.products);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [availableFilters, setAvailableFilters] = useState({ brands: [], strapMaterials: [], genders: [] });

  // Read filters from URL
  const filters = {
    brand: searchParams.get('brand') || '',
    gender: searchParams.get('gender') || '',
    strapMaterial: searchParams.get('strapMaterial') || '',
    featured: searchParams.get('featured') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: searchParams.get('page') || '1',
    search: searchParams.get('search') || '',
  };

  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    dispatch(fetchProducts(params));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, dispatch]);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const { data } = await api.get('/products/filters/available');
        setAvailableFilters(data);
      } catch (err) {
        console.error('Failed to load filters:', err);
      }
    };
    loadFilters();
  }, []);

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const goToPage = (p) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', p.toString());
    setSearchParams(params);
  };

  const hasActiveFilters =
    filters.brand || filters.gender || filters.strapMaterial || filters.featured || filters.minPrice || filters.maxPrice;

  return (
    <div className="pt-6 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif"
          >
            Our Collection
          </motion.h1>
          <p className="mt-3 text-luxury-gray">
            {total} timepiece{total !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-luxury-gray-dark/30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 text-sm text-luxury-white/80 hover:text-luxury-gold transition-colors px-4 py-2 border border-luxury-gray-dark"
            >
              <HiOutlineAdjustments className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-luxury-gold text-luxury-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  !
                </span>
              )}
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-luxury-gray hover:text-red-400 transition-colors">
                Clear all
              </button>
            )}
          </div>

          {/* Search */}
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search watches..."
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              className="input-luxury text-sm w-48 md:w-64"
            />
            <select
              value={filters.sort}
              onChange={(e) => setFilter('sort', e.target.value)}
              className="input-luxury text-sm w-48"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <AnimatePresence>
            {filterOpen && (
              <>
                {/* Mobile overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                  onClick={() => setFilterOpen(false)}
                />
                <motion.aside
                  initial={{ x: '-100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '-100%', opacity: 0 }}
                  transition={{ type: 'tween', duration: 0.3 }}
                  className="fixed inset-y-0 left-0 z-50 w-[280px] bg-luxury-black border-r border-luxury-gray-dark/30 overflow-y-auto p-6 lg:hidden"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-serif text-luxury-gold">Filters</h3>
                    <button onClick={() => setFilterOpen(false)} className="text-luxury-gray hover:text-luxury-white">
                      <HiOutlineX className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-8">
                    {/* Brand */}
                    <div>
                      <h4 className="text-sm text-luxury-gold tracking-wider uppercase mb-3">Brand</h4>
                      {availableFilters.brands.map((b) => (
                        <label key={b} className="flex items-center gap-3 py-1 cursor-pointer group">
                          <input type="radio" name="brand-m" checked={filters.brand === b} onChange={() => setFilter('brand', filters.brand === b ? '' : b)} className="accent-luxury-gold" />
                          <span className="text-sm text-luxury-gray group-hover:text-luxury-white transition-colors">{b}</span>
                        </label>
                      ))}
                    </div>
                    {/* Gender */}
                    <div>
                      <h4 className="text-sm text-luxury-gold tracking-wider uppercase mb-3">Gender</h4>
                      {availableFilters.genders.map((g) => (
                        <label key={g} className="flex items-center gap-3 py-1 cursor-pointer group">
                          <input type="radio" name="gender-m" checked={filters.gender === g} onChange={() => setFilter('gender', filters.gender === g ? '' : g)} className="accent-luxury-gold" />
                          <span className="text-sm text-luxury-gray group-hover:text-luxury-white transition-colors capitalize">{g}</span>
                        </label>
                      ))}
                    </div>
                    {/* Strap */}
                    <div>
                      <h4 className="text-sm text-luxury-gold tracking-wider uppercase mb-3">Strap Material</h4>
                      {availableFilters.strapMaterials.map((s) => (
                        <label key={s} className="flex items-center gap-3 py-1 cursor-pointer group">
                          <input type="radio" name="strap-m" checked={filters.strapMaterial === s} onChange={() => setFilter('strapMaterial', filters.strapMaterial === s ? '' : s)} className="accent-luxury-gold" />
                          <span className="text-sm text-luxury-gray group-hover:text-luxury-white transition-colors">{s}</span>
                        </label>
                      ))}
                    </div>
                    {/* Price Range */}
                    <div>
                      <h4 className="text-sm text-luxury-gold tracking-wider uppercase mb-3">Price Range</h4>
                      <div className="flex gap-2">
                        <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilter('minPrice', e.target.value)} className="input-luxury text-sm w-full" />
                        <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilter('maxPrice', e.target.value)} className="input-luxury text-sm w-full" />
                      </div>
                    </div>
                    {/* Featured */}
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={filters.featured === 'true'} onChange={(e) => setFilter('featured', e.target.checked ? 'true' : '')} className="accent-luxury-gold" />
                      <span className="text-sm text-luxury-gray group-hover:text-luxury-white transition-colors">Featured Only</span>
                    </label>
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="mt-8 w-full bg-luxury-gold text-luxury-black font-semibold py-3 hover:bg-luxury-gold-light transition-colors"
                  >
                    Apply Filters
                  </button>
                </motion.aside>

                {/* Desktop sidebar */}
                <motion.aside
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 260 }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-shrink-0 overflow-hidden hidden lg:block"
                >
                <div className="w-[260px] space-y-8">
                  {/* Brand */}
                  <div>
                    <h4 className="text-sm text-luxury-gold tracking-wider uppercase mb-3">Brand</h4>
                    {availableFilters.brands.map((b) => (
                      <label key={b} className="flex items-center gap-3 py-1 cursor-pointer group">
                        <input
                          type="radio"
                          name="brand"
                          checked={filters.brand === b}
                          onChange={() => setFilter('brand', filters.brand === b ? '' : b)}
                          className="accent-luxury-gold"
                        />
                        <span className="text-sm text-luxury-gray group-hover:text-luxury-white transition-colors">
                          {b}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Gender */}
                  <div>
                    <h4 className="text-sm text-luxury-gold tracking-wider uppercase mb-3">Gender</h4>
                    {availableFilters.genders.map((g) => (
                      <label key={g} className="flex items-center gap-3 py-1 cursor-pointer group">
                        <input
                          type="radio"
                          name="gender"
                          checked={filters.gender === g}
                          onChange={() => setFilter('gender', filters.gender === g ? '' : g)}
                          className="accent-luxury-gold"
                        />
                        <span className="text-sm text-luxury-gray group-hover:text-luxury-white transition-colors capitalize">
                          {g}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Strap */}
                  <div>
                    <h4 className="text-sm text-luxury-gold tracking-wider uppercase mb-3">Strap Material</h4>
                    {availableFilters.strapMaterials.map((s) => (
                      <label key={s} className="flex items-center gap-3 py-1 cursor-pointer group">
                        <input
                          type="radio"
                          name="strap"
                          checked={filters.strapMaterial === s}
                          onChange={() => setFilter('strapMaterial', filters.strapMaterial === s ? '' : s)}
                          className="accent-luxury-gold"
                        />
                        <span className="text-sm text-luxury-gray group-hover:text-luxury-white transition-colors">
                          {s}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Price Range */}
                  <div>
                    <h4 className="text-sm text-luxury-gold tracking-wider uppercase mb-3">Price Range</h4>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => setFilter('minPrice', e.target.value)}
                        className="input-luxury text-sm w-full"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => setFilter('maxPrice', e.target.value)}
                        className="input-luxury text-sm w-full"
                      />
                    </div>
                  </div>

                  {/* Featured */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.featured === 'true'}
                      onChange={(e) => setFilter('featured', e.target.checked ? 'true' : '')}
                      className="accent-luxury-gold"
                    />
                    <span className="text-sm text-luxury-gray group-hover:text-luxury-white transition-colors">
                      Featured Only
                    </span>
                  </label>
                </div>
              </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-luxury-gray text-lg">No watches found matching your criteria.</p>
                <button onClick={clearFilters} className="mt-4 btn-outline text-sm">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {items.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goToPage(i + 1)}
                        className={`w-10 h-10 text-sm transition-colors ${
                          page === i + 1
                            ? 'bg-luxury-gold text-luxury-black font-semibold'
                            : 'border border-luxury-gray-dark text-luxury-gray hover:border-luxury-gold hover:text-luxury-gold'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
