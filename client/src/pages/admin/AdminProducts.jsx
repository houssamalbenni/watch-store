import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineStar, HiOutlineDuplicate } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../lib/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async (pg = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', { params: { page: pg, limit: 10 } });
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts(page);
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleDuplicate = async (id, title) => {
    if (!window.confirm(`Duplicate "${title}"?`)) return;
    try {
      const { data } = await api.post(`/products/${id}/duplicate`);
      toast.success(`"${data.title}" created successfully`);
      
      // Add new product to current list instead of refetching
      setProducts(prev => [data, ...prev]);
    } catch {
      toast.error('Failed to duplicate product');
    }
  };

  const toggleFeatured = async (product) => {
    try {
      await api.put(`/products/${product._id}`, { featured: !product.featured });
      toast.success(product.featured ? 'Removed from featured' : 'Added to featured');
      fetchProducts(page);
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif">Products</h1>
        <Link to="/control-panel/products/new" className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-luxury-gray">No products found.</p>
        </div>
      ) : (
        <>
          <div className="card-luxury overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-luxury-gray-dark/30 text-left">
                  <th className="px-6 py-4 text-xs text-luxury-gray uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-xs text-luxury-gray uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-4 text-xs text-luxury-gray uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-xs text-luxury-gray uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-xs text-luxury-gray uppercase tracking-wider">Featured</th>
                  <th className="px-6 py-4 text-xs text-luxury-gray uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, i) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-luxury-gray-dark/10 hover:bg-luxury-dark/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-luxury-dark overflow-hidden flex-shrink-0">
                          <img
                            src={product.images?.[0] || 'https://via.placeholder.com/50'}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-sm font-medium truncate max-w-[200px]">{product.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-luxury-gray">{product.brand}</td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-sm text-luxury-gold">${product.price.toLocaleString()}</span>
                        {product.discountPrice && (
                          <span className="text-xs text-luxury-gray ml-2 line-through">
                            ${product.discountPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm ${
                          product.stock > 10 ? 'text-green-400' : product.stock > 0 ? 'text-yellow-400' : 'text-red-400'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleFeatured(product)}>
                        <HiOutlineStar
                          className={`w-5 h-5 transition-colors ${
                            product.featured ? 'text-luxury-gold fill-luxury-gold' : 'text-luxury-gray hover:text-luxury-gold'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/control-panel/products/edit/${product._id}`}
                          className="p-2 text-luxury-gray hover:text-luxury-gold transition-colors"
                          title="Edit"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(product._id, product.title)}
                          className="p-2 text-luxury-gray hover:text-blue-400 transition-colors"
                          title="Duplicate"
                        >
                          <HiOutlineDuplicate className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id, product.title)}
                          className="p-2 text-luxury-gray hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchProducts(i + 1)}
                  className={`w-10 h-10 text-sm transition-colors ${
                    page === i + 1
                      ? 'bg-luxury-gold text-luxury-black'
                      : 'border border-luxury-gray-dark text-luxury-gray hover:border-luxury-gold'
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
  );
};

export default AdminProducts;
