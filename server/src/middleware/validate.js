import { z } from 'zod';

// ── Auth ──
const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ── Product ──
const productSchema = z.object({
  title: z.string().min(1).max(200),
  brand: z.string().min(1).max(100),
  price: z.number().min(0),
  discountPrice: z.number().min(0).nullable().optional(),
  description: z.string().min(1),
  specifications: z
    .object({
      caseSize: z.string().optional(),
      caseMaterial: z.string().optional(),
      strapMaterial: z.string().optional(),
      strapColor: z.string().optional(),
      movement: z.string().optional(),
      waterResistance: z.string().optional(),
      dialColor: z.string().optional(),
      gender: z.enum(['men', 'women', 'unisex']).optional(),
    })
    .optional(),
  images: z.array(z.string().url()).optional(),
  stock: z.number().int().min(0).optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  category: z.string().optional(),
});

const productUpdateSchema = productSchema.partial();

// ── Order ──
const orderItemSchema = z.object({
  productId: z.string().min(1),
  title: z.string().min(1),
  price: z.number().min(0),
  qty: z.number().int().min(1),
  image: z.string().optional(),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  subtotal: z.number().min(0),
  shipping: z.number().min(0).optional(),
  total: z.number().min(0),
  paymentMethod: z.string().optional(),
  shippingAddress: z.object({
    fullName: z.string().min(1),
    phone: z.string().min(1),
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().min(1),
  }),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']),
});

// ── Middleware ──
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: err.errors?.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
  }
};

export {
  registerSchema,
  loginSchema,
  productSchema,
  productUpdateSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  validate,
};
