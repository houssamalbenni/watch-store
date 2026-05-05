import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { HiOutlineUpload, HiOutlineX, HiOutlineArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../lib/api';

const productFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  brand: z.string().min(1, 'Brand is required'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  discountPrice: z.coerce.number().min(0).nullable().optional(),
  description: z.string().min(1, 'Description is required'),
  stock: z.coerce.number().int().min(0).optional(),
  featured: z.boolean().optional(),
  category: z.string().optional(),
  caseSize: z.string().optional(),
  caseMaterial: z.string().optional(),
  strapMaterial: z.string().optional(),
  strapColor: z.string().optional(),
  movement: z.string().optional(),
  waterResistance: z.string().optional(),
  dialColor: z.string().optional(),
  gender: z.enum(['men', 'women', 'unisex']).optional(),
  tags: z.string().optional(),
});

const getImageCompressionSettings = () => {
  if (typeof navigator === 'undefined') {
    return { maxSize: 1600, quality: 0.85 };
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!connection) {
    return { maxSize: 1600, quality: 0.85 };
  }

  if (connection.saveData) {
    return { maxSize: 1200, quality: 0.6 };
  }

  switch (connection.effectiveType) {
    case 'slow-2g':
      return { maxSize: 1000, quality: 0.55 };
    case '2g':
      return { maxSize: 1200, quality: 0.6 };
    case '3g':
      return { maxSize: 1400, quality: 0.7 };
    case '4g':
      return { maxSize: 1600, quality: 0.85 };
    default:
      return { maxSize: 1600, quality: 0.85 };
  }
};

const loadImage = (file) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = URL.createObjectURL(file);
});

const compressImageFile = async (file) => {
  if (!file?.type?.startsWith('image/')) return file;

  const { maxSize, quality } = getImageCompressionSettings();
  const outputType = file.type === 'image/png'
    ? 'image/png'
    : file.type === 'image/webp'
      ? 'image/webp'
      : 'image/jpeg';

  const image = await loadImage(file);
  const ratio = Math.min(1, maxSize / image.width, maxSize / image.height);
  const targetWidth = Math.max(1, Math.round(image.width * ratio));
  const targetHeight = Math.max(1, Math.round(image.height * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

  const blob = await new Promise((resolve) => {
    if (outputType === 'image/png') {
      canvas.toBlob(resolve, outputType);
    } else {
      canvas.toBlob(resolve, outputType, quality);
    }
  });

  URL.revokeObjectURL(image.src);

  if (!blob) return file;

  const extension = outputType === 'image/png'
    ? 'png'
    : outputType === 'image/webp'
      ? 'webp'
      : 'jpg';
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const newName = `${baseName}.${extension}`;

  return new File([blob], newName, { type: outputType });
};

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      featured: false,
      stock: 0,
      gender: 'unisex',
    },
  });

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const { data } = await api.get(`/products/${id}`);
          setValue('title', data.title);
          setValue('brand', data.brand);
          setValue('price', data.price);
          setValue('discountPrice', data.discountPrice || '');
          setValue('description', data.description);
          setValue('stock', data.stock);
          setValue('featured', data.featured);
          setValue('category', data.category);
          setValue('tags', data.tags?.join(', ') || '');
          // Specifications
          const specs = data.specifications || {};
          setValue('caseSize', specs.caseSize || '');
          setValue('caseMaterial', specs.caseMaterial || '');
          setValue('strapMaterial', specs.strapMaterial || '');
          setValue('strapColor', specs.strapColor || '');
          setValue('movement', specs.movement || '');
          setValue('waterResistance', specs.waterResistance || '');
          setValue('dialColor', specs.dialColor || '');
          setValue('gender', specs.gender || 'unisex');
          setImages(data.images || []);
          setVideos(data.videos || []);
        } catch {
          toast.error('Product not found');
          navigate('/control-panel/products');
        }
      };
      fetchProduct();
    }
  }, [id, isEdit, navigate, setValue]);

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    const formData = new FormData();
    const processedFiles = await Promise.all(
      Array.from(files).map(async (file) => {
        try {
          return await compressImageFile(file);
        } catch (err) {
          console.warn('Image compression failed, uploading original file.', err);
          return file;
        }
      })
    );
    processedFiles.forEach((file) => formData.append('images', file));

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImages((prev) => [...prev, ...data.urls]);
      toast.success(`${data.urls.length} image(s) uploaded`);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploadingVideos(true);
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('videos', f));

    try {
      const { data } = await api.post('/upload/videos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setVideos((prev) => [...prev, ...data.urls]);
      toast.success(`${data.urls.length} video(s) uploaded`);
    } catch {
      toast.error('Video upload failed');
    } finally {
      setUploadingVideos(false);
    }
  };

  const removeVideo = (index) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);

    const payload = {
      title: formData.title,
      brand: formData.brand,
      price: formData.price,
      discountPrice: formData.discountPrice || null,
      description: formData.description,
      stock: formData.stock || 0,
      featured: formData.featured || false,
      category: formData.category || 'watches',
      images,
      videos,
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      specifications: {
        caseSize: formData.caseSize || '',
        caseMaterial: formData.caseMaterial || '',
        strapMaterial: formData.strapMaterial || '',
        strapColor: formData.strapColor || '',
        movement: formData.movement || '',
        waterResistance: formData.waterResistance || '',
        dialColor: formData.dialColor || '',
        gender: formData.gender || 'unisex',
      },
    };

    try {
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      navigate('/control-panel/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => navigate('/control-panel/products')}
        className="flex items-center gap-2 text-luxury-gray hover:text-luxury-gold text-sm mb-6 transition-colors"
      >
        <HiOutlineArrowLeft className="w-4 h-4" /> Back to Products
      </button>

      <h1 className="text-3xl font-serif mb-8">
        {isEdit ? 'Edit Product' : 'New Product'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
        {/* Basic Info */}
        <div className="card-luxury p-8">
          <h2 className="text-lg font-serif mb-6">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm text-luxury-gray block mb-1">Title *</label>
              <input {...register('title')} className="input-luxury" placeholder="Royal Chronograph Gold" />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="text-sm text-luxury-gray block mb-1">Brand *</label>
              <input {...register('brand')} className="input-luxury" placeholder="Sa3ati Heritage" />
              {errors.brand && <p className="text-red-400 text-xs mt-1">{errors.brand.message}</p>}
            </div>
            <div>
              <label className="text-sm text-luxury-gray block mb-1">Category</label>
              <input {...register('category')} className="input-luxury" placeholder="watches" />
            </div>
            <div>
              <label className="text-sm text-luxury-gray block mb-1">Price *</label>
              <input {...register('price')} type="number" step="0.01" className="input-luxury" />
              {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="text-sm text-luxury-gray block mb-1">Discount Price</label>
              <input {...register('discountPrice')} type="number" step="0.01" className="input-luxury" placeholder="Optional" />
            </div>
            <div>
              <label className="text-sm text-luxury-gray block mb-1">Stock</label>
              <input {...register('stock')} type="number" className="input-luxury" />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input {...register('featured')} type="checkbox" className="accent-luxury-gold w-5 h-5" />
              <label className="text-sm text-luxury-gray">Featured Product</label>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-luxury-gray block mb-1">Description *</label>
              <textarea {...register('description')} rows={4} className="input-luxury resize-none" />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-luxury-gray block mb-1">Tags (comma separated)</label>
              <input {...register('tags')} className="input-luxury" placeholder="luxury, gold, automatic" />
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="card-luxury p-8">
          <h2 className="text-lg font-serif mb-6">Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-luxury-gray block mb-1">Case Size</label>
              <input {...register('caseSize')} className="input-luxury" placeholder="42mm" />
            </div>
            <div>
              <label className="text-sm text-luxury-gray block mb-1">Case Material</label>
              <input {...register('caseMaterial')} className="input-luxury" placeholder="18K Gold" />
            </div>
            <div>
              <label className="text-sm text-luxury-gray block mb-1">Strap Material</label>
              <input {...register('strapMaterial')} className="input-luxury" placeholder="Leather" />
            </div>
            <div>
              <label className="text-sm text-luxury-gray block mb-1">Strap Color</label>
              <input {...register('strapColor')} className="input-luxury" placeholder="Brown" />
            </div>
            <div>
              <label className="text-sm text-luxury-gray block mb-1">Movement</label>
              <input {...register('movement')} className="input-luxury" placeholder="Automatic" />
            </div>
            <div>
              <label className="text-sm text-luxury-gray block mb-1">Water Resistance</label>
              <input {...register('waterResistance')} className="input-luxury" placeholder="50m" />
            </div>
            <div>
              <label className="text-sm text-luxury-gray block mb-1">Dial Color</label>
              <input {...register('dialColor')} className="input-luxury" placeholder="Champagne Gold" />
            </div>
            <div>
              <label className="text-sm text-luxury-gray block mb-1">Gender</label>
              <select {...register('gender')} className="input-luxury">
                <option value="unisex">Unisex</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card-luxury p-8">
          <h2 className="text-lg font-serif mb-6">Images</h2>

          {/* Upload area */}
          <label className="border-2 border-dashed border-luxury-gray-dark hover:border-luxury-gold cursor-pointer flex flex-col items-center justify-center py-10 transition-colors">
            <HiOutlineUpload className="w-8 h-8 text-luxury-gray mb-3" />
            <p className="text-sm text-luxury-gray">
              {uploading ? 'Uploading...' : 'Click to upload images'}
            </p>
            <p className="text-xs text-luxury-gray mt-1">JPG, PNG, WebP — max 5MB each</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {/* Preview */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-6">
              {images.map((url, i) => (
                <div key={i} className="relative w-24 h-24 bg-luxury-dark overflow-hidden group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <HiOutlineX className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Videos */}
        <div className="card-luxury p-8">
          <h2 className="text-lg font-serif mb-6">Videos</h2>
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-3 text-sm text-luxury-gray cursor-pointer">
              <HiOutlineUpload className="w-5 h-5" />
              <span>{uploadingVideos ? 'Uploading...' : 'Upload videos'}</span>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                multiple
                onChange={handleVideoUpload}
                className="hidden"
              />
            </label>

            {videos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos.map((video, index) => (
                  <div key={video} className="relative border border-luxury-gray-dark p-3">
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full hover:bg-black"
                    >
                      <HiOutlineX className="w-4 h-4" />
                    </button>
                    <video src={video} controls className="w-full h-48 bg-black" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary disabled:opacity-50"
          >
            {submitting ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/control-panel/products')}
            className="btn-outline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
