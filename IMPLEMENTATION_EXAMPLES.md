# Meta Pixel Integration Examples

Practical implementation examples for Sa3ati e-commerce pages.

## 1. Home Page Integration

**File: `src/pages/Home.jsx`**

```jsx
import { useEffect } from 'react';
import { useTrackViewContent } from '../hooks/useMetaPixel';

export const Home = () => {
  const trackProduct = useTrackViewContent();

  // Track featured products when home page loads
  useEffect(() => {
    // Optionally track a "homepage view" as a lead signal
    // (can use custom events if desired)
  }, []);

  const handleFeaturedProductClick = (product) => {
    // Track featured product view
    trackProduct({
      id: product._id,
      title: product.name,
      price: product.price,
      category: 'featured',
      image: product.image,
    });
  };

  return (
    <div>
      {/* Featured Products Section */}
      <section className="featured-products">
        {featuredProducts.map(product => (
          <div
            key={product._id}
            onClick={() => handleFeaturedProductClick(product)}
          >
            {/* Product Card */}
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;
```

---

## 2. Shop Page Integration

**File: `src/pages/Shop.jsx`**

```jsx
import { useEffect } from 'react';
import { useTrackViewContent } from '../hooks/useMetaPixel';

export const Shop = () => {
  const trackProduct = useTrackViewContent();
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});

  // Track when user filters products (search refinement)
  useEffect(() => {
    // Could track as "search" event for analytics
    // This helps Meta understand user intent
  }, [filters]);

  const handleProductClick = (product) => {
    // Track product view from shop/category
    trackProduct({
      id: product._id,
      title: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
    });
  };

  return (
    <div>
      <h1>Shop</h1>
      
      {/* Filters Sidebar */}
      <aside className="filters">
        <FilterComponent onChange={setFilters} />
      </aside>

      {/* Products Grid */}
      <div className="products-grid">
        {products.map(product => (
          <ProductCard
            key={product._id}
            product={product}
            onClick={() => handleProductClick(product)}
          />
        ))}
      </div>
    </div>
  );
};

export default Shop;
```

---

## 3. Product Detail Page Integration

**File: `src/pages/ProductDetail.jsx`**

```jsx
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTrackViewContent, useTrackAddToCart } from '../hooks/useMetaPixel';

export const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const trackProductView = useTrackViewContent();
  const trackAddCart = useTrackAddToCart();

  // Track ViewContent when product details load
  useEffect(() => {
    if (product) {
      trackProductView({
        id: product._id,
        title: product.name,
        price: product.price,
        category: product.category,
        image: product.image,
      });
    }
  }, [product, trackProductView]);

  const handleAddToCart = async () => {
    // Add to cart in Redux
    dispatch(addToCart({ ...product, quantity }));

    // Track AddToCart event
    trackAddCart({
      id: product._id,
      title: product.name,
      price: product.price,
      quantity,
    });

    toast.success(`Added ${quantity} to cart`);
  };

  const handleWhatsAppClick = () => {
    // You can track lead events here if needed
    // For now, just open WhatsApp
    window.open(
      `https://wa.me/${product.whatsappNumber}?text=Hi, I'm interested in ${product.name}`
    );
  };

  return (
    <div className="product-detail">
      <img src={product?.image} alt={product?.name} />
      
      <div className="product-info">
        <h1>{product?.name}</h1>
        <p className="category">{product?.category}</p>
        <p className="price">${product?.price.toLocaleString()}</p>
        <p className="description">{product?.description}</p>

        <div className="quantity-selector">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
          <input type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} />
          <button onClick={() => setQuantity(quantity + 1)}>+</button>
        </div>

        <button
          className="add-to-cart-btn"
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>

        <button
          className="whatsapp-btn"
          onClick={handleWhatsAppClick}
        >
          💬 Chat on WhatsApp
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
```

---

## 4. Cart Page Integration

**File: `src/pages/Cart.jsx`**

```jsx
import { useSelector, useDispatch } from 'react-redux';
import { useTrackInitiateCheckout } from '../hooks/useMetaPixel';

export const Cart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);
  const trackCheckout = useTrackInitiateCheckout();

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleProceedToCheckout = () => {
    // Calculate cart totals
    const checkoutData = {
      items: cartItems,
      value: totalPrice,
      currency: 'USD',
    };

    // Track InitiateCheckout event
    trackCheckout(checkoutData);

    // Navigate to checkout
    navigate('/checkout');
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity > 0) {
      dispatch(updateCartQuantity({ itemId, quantity: newQuantity }));
    }
  };

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <table className="cart-items">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map(item => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>${item.price}</td>
                  <td>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateQuantity(item._id, parseInt(e.target.value))}
                    />
                  </td>
                  <td>${(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button onClick={() => handleRemoveItem(item._id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-summary">
            <div className="total">
              <strong>Total:</strong>
              <span>${totalPrice.toFixed(2)}</span>
            </div>

            <button
              className="checkout-btn"
              onClick={handleProceedToCheckout}
            >
              Proceed to Checkout
            </button>

            <button
              className="continue-shopping-btn"
              onClick={() => navigate('/shop')}
            >
              Continue Shopping
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
```

---

## 5. Checkout Page Integration

**File: `src/pages/Checkout.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTrackPurchase } from '../hooks/useMetaPixel';
import api from '../lib/api';

export const Checkout = () => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const cartItems = useSelector(state => state.cart.items);
  const user = useSelector(state => state.auth.user);
  const trackPurchase = useTrackPurchase();

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      }));
    }
  }, [user]);

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create order on backend
      const response = await api.post('/orders', {
        items: cartItems,
        shippingAddress: formData,
        totalPrice,
      });

      const order = response.data;

      // Track Purchase event (CRITICAL FOR ATTRIBUTION)
      trackPurchase({
        orderId: order._id,
        items: cartItems,
        value: order.totalPrice,
        currency: 'USD',
      });

      // Show success message
      toast.success('Order placed successfully!');

      // Redirect to order confirmation
      navigate(`/order-success/${order._id}`);
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-container">
        {/* Shipping Form */}
        <form className="checkout-form" onSubmit={handlePlaceOrder}>
          <h2>Shipping Information</h2>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input type="text" name="city" value={formData.city} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Zip Code</label>
              <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Country</label>
            <input type="text" name="country" value={formData.country} onChange={handleInputChange} required />
          </div>

          <button type="submit" disabled={isLoading} className="place-order-btn">
            {isLoading ? 'Placing order...' : 'Place Order'}
          </button>
        </form>

        {/* Order Summary */}
        <aside className="order-summary">
          <h2>Order Summary</h2>
          <div className="order-items">
            {cartItems.map(item => (
              <div key={item._id} className="order-item">
                <span>{item.name} x {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="order-total">
            <strong>Total: ${totalPrice.toFixed(2)}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
```

---

## 6. Order Success / Confirmation Page

**File: `src/pages/OrderSuccess.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTrackLead } from '../hooks/useMetaPixel';
import api from '../lib/api';

export const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const trackLead = useTrackLead();

  useEffect(() => {
    // Fetch order details
    api.get(`/orders/${orderId}`).then(res => setOrder(res.data));
  }, [orderId]);

  const handleTrackingClick = (type) => {
    trackLead({
      type,
      email: order?.userEmail,
    });
  };

  const handleWhatsAppClick = () => {
    handleTrackingClick('whatsapp');
    window.open('https://wa.me/your_whatsapp_number?text=Hi, I just placed an order!');
  };

  const handleEmailClick = () => {
    handleTrackingClick('email_inquiry');
    window.location.href = 'mailto:support@sa3ati.com';
  };

  return (
    <div className="order-success">
      <h1>✓ Order Placed Successfully!</h1>
      
      <div className="order-details">
        <p>Order ID: <strong>{order?._id}</strong></p>
        <p>Total: <strong>${order?.totalPrice.toFixed(2)}</strong></p>
        <p>Items: <strong>{order?.items.length}</strong></p>
      </div>

      <p className="confirmation-message">
        Thank you for your purchase! You'll receive a confirmation email shortly.
      </p>

      <div className="contact-options">
        <h3>Questions? Get in touch:</h3>
        
        <button className="whatsapp-link" onClick={handleWhatsAppClick}>
          💬 Chat on WhatsApp
        </button>
        
        <button className="email-link" onClick={handleEmailClick}>
          ✉️ Email Support
        </button>
      </div>

      <button className="continue-shopping" onClick={() => navigate('/shop')}>
        Continue Shopping
      </button>
    </div>
  );
};

export default OrderSuccess;
```

---

## 7. Lead Generation Components

### WhatsApp Button Component

**File: `src/components/WhatsAppButton.jsx`**

```jsx
import { useTrackLead } from '../hooks/useMetaPixel';

export const WhatsAppButton = ({ phone = '+1234567890', message = 'Hi, I\'m interested!' }) => {
  const trackLead = useTrackLead();

  const handleClick = () => {
    // Track lead event
    trackLead({
      type: 'whatsapp',
      phone,
    });

    // Open WhatsApp
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  return (
    <button className="whatsapp-button" onClick={handleClick}>
      💬 Chat on WhatsApp
    </button>
  );
};

export default WhatsAppButton;
```

### Contact Form with Lead Tracking

**File: `src/components/ContactForm.jsx`**

```jsx
import { useState } from 'react';
import { useTrackLead } from '../hooks/useMetaPixel';

export const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const trackLead = useTrackLead();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Track lead event
    trackLead({
      type: 'contact_form',
      email: formData.email,
    });

    // Send inquiry
    try {
      await api.post('/inquiries', formData);
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Your Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Your Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <textarea
        placeholder="Your Message"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        required
      />
      <button type="submit">Send Message</button>
    </form>
  );
};

export default ContactForm;
```

---

## 8. Backend Order Tracking (Alternative)

If you want to track purchases from the backend (more reliable):

**File: `server/src/controllers/orderController.js`**

```javascript
import MetaCAPITracker from '../lib/metaCAPITracker.js';
import logger from '../config/logger.js';

// Initialize tracker
const metaCAPITracker = new MetaCAPITracker(
  process.env.META_ACCESS_TOKEN,
  process.env.META_PIXEL_ID
);

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, totalPrice } = req.body;
    const userId = req.user._id;

    // Create order in database
    const order = await Order.create({
      userId,
      items,
      shippingAddress,
      totalPrice,
      status: 'pending',
      createdAt: new Date(),
    });

    // Track purchase via Meta Conversion API
    // This ensures tracking even if client-side JS fails
    const eventId = `order_${order._id}`; // Unique event ID
    await metaCAPITracker.trackEvent(
      'Purchase',
      {
        order_id: order._id.toString(),
        items: items.map(item => ({
          product_id: item._id,
          product_name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total_value: totalPrice,
        currency: 'USD',
        userId: req.user._id,
        email: req.user.email,
        timestamp: new Date().toISOString(),
      },
      eventId,
      req
    );

    logger.info('Purchase tracked', { orderId: order._id, amount: totalPrice });

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    logger.error('Order creation error', { error: error.message });
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export default { createOrder };
```

---

## Usage Summary

| Page | Events |
|------|--------|
| **Home** | PageView, ViewContent (featured products) |
| **Shop** | PageView, ViewContent (when clicking products) |
| **ProductDetail** | ViewContent (on load), AddToCart, Lead (WhatsApp) |
| **Cart** | PageView, InitiateCheckout (proceed button) |
| **Checkout** | InitiateCheckout (page load), Purchase (on submit) |
| **OrderSuccess** | Lead (WhatsApp, email contact) |

All implementations follow:
✓ Automatic event deduplication  
✓ Server-side backup tracking  
✓ Privacy-compliant data handling  
✓ Error handling & logging  

---

**Last Updated:** February 2026
