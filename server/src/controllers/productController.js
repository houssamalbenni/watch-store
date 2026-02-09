import Product from '../models/Product.js';

// Simple in-memory cache for filters (15 minutes)
let filtersCache = null;
let filtersCacheTime = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

/** GET /api/products  — public, with filters + pagination */
export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      brand,
      minPrice,
      maxPrice,
      gender,
      featured,
      sort = '-createdAt',
      search,
      strapMaterial,
    } = req.query;

    const filter = {};
    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    if (gender) {
      // Include unisex products with men/women
      filter['specifications.gender'] = { $in: [gender, 'unisex'] };
    }
    if (strapMaterial) filter['specifications.strapMaterial'] = { $regex: strapMaterial, $options: 'i' };
    if (featured === 'true') filter.featured = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    // Sort by displayOrder first (for custom manual ordering), then by other criteria
    let sortOptions = { displayOrder: 1 };
    if (sort === '-createdAt') sortOptions.createdAt = -1;
    else if (sort === 'price') sortOptions.price = 1;
    else if (sort === '-price') sortOptions.price = -1;
    else if (sort === 'title') sortOptions.title = 1;
    
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOptions).skip(skip).limit(Number(limit)).lean(),
      Product.countDocuments(filter),
    ]);

    const isAdminList = req.query.admin === 'true';
    if (isAdminList) {
      res.set('Cache-Control', 'no-store');
    } else {
      res.set('Cache-Control', 'public, max-age=300');
    }
    res.json({
      products,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/products/:id */
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.set('Cache-Control', 'public, max-age=600');
    res.json(product);
  } catch (err) {
    next(err);
  }
};

/** POST /api/products  (admin) */
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

/** PUT /api/products/:id  (admin) */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/products/:id  (admin) */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

/** POST /api/products/:id/duplicate  (admin) - Duplicate a product */
export const duplicateProduct = async (req, res, next) => {
  try {
    const original = await Product.findById(req.params.id).lean();
    if (!original) return res.status(404).json({ message: 'Product not found' });

    // Remove _id and timestamps, add "(Copy)" to title
    const { _id, createdAt, updatedAt, ...productData } = original;
    productData.title = `${productData.title} (Copy)`;
    productData.featured = false; // Don't duplicate featured status

    const duplicate = await Product.create(productData);
    res.status(201).json(duplicate);
  } catch (err) {
    next(err);
  }
};

/** GET /api/products/filters/available — public, get available filter options */
export const getAvailableFilters = async (req, res, next) => {
  try {
    // Return cached filters if available and not expired
    if (filtersCache && filtersCacheTime && Date.now() - filtersCacheTime < CACHE_DURATION) {
      res.set('Cache-Control', 'public, max-age=900');
      return res.json(filtersCache);
    }

    const [brands, strapMaterials, genders] = await Promise.all([
      Product.distinct('brand'),
      Product.distinct('specifications.strapMaterial'),
      Product.distinct('specifications.gender'),
    ]);

    filtersCache = {
      brands: brands.filter(Boolean).sort(),
      strapMaterials: strapMaterials.filter(Boolean).sort(),
      genders: genders.filter(Boolean).sort(),
    };
    filtersCacheTime = Date.now();

    res.set('Cache-Control', 'public, max-age=900');
    res.json(filtersCache);
  } catch (err) {
    next(err);
  }
};

/** POST /api/products/reorder  (admin) - Reorder products */
export const reorderProducts = async (req, res, next) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds)) {
      return res.status(400).json({ message: 'productIds must be an array' });
    }

    // Update displayOrder for each product based on array index
    const updates = productIds.map((id, index) =>
      Product.findByIdAndUpdate(id, { displayOrder: index }, { new: true })
    );

    await Promise.all(updates);
    res.json({ message: 'Products reordered successfully' });
  } catch (err) {
    next(err);
  }
};
