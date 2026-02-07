import Product from '../models/Product.js';

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
    
    // If filtering by gender, prioritize featured products first
    let sortOptions = sort;
    if (gender) {
      sortOptions = { featured: -1 }; // Featured first
      // Then apply the requested sort
      if (sort === '-createdAt') sortOptions.createdAt = -1;
      else if (sort === 'price') sortOptions.price = 1;
      else if (sort === '-price') sortOptions.price = -1;
      else if (sort === 'title') sortOptions.title = 1;
    }
    
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOptions).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

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
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
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

/** GET /api/products/filters/available — public, get available filter options */
export const getAvailableFilters = async (req, res, next) => {
  try {
    const [brands, strapMaterials, genders] = await Promise.all([
      Product.distinct('brand'),
      Product.distinct('specifications.strapMaterial'),
      Product.distinct('specifications.gender'),
    ]);

    res.json({
      brands: brands.filter(Boolean).sort(),
      strapMaterials: strapMaterials.filter(Boolean).sort(),
      genders: genders.filter(Boolean).sort(),
    });
  } catch (err) {
    next(err);
  }
};
