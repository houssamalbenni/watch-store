# Link Click Tracking - Implementation Examples

Quick copy-paste examples for integrating link click tracking into your components.

## ProductDetail.jsx - WhatsApp & Email Integration

```jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useLinkClickTracking } from '../hooks/useLinkClickTracking';
import { FaWhatsapp, FaPhone, FaEnvelope } from 'react-icons/fa';

const ProductDetail = () => {
  const { id } = useParams();
  const product = useSelector(state => state.products.currentProduct);
  const { trackLinkClick, trackAndNavigate } = useLinkClickTracking();
  const [loading, setLoading] = useState(false);

  const WHATSAPP_NUMBER = '971XXXXXXX'; // Update with actual number
  const BUSINESS_EMAIL = 'sales@sa3ati.com';
  const BUSINESS_PHONE = '+971XXXXXXX';

  // Handle WhatsApp click
  const handleWhatsAppClick = async () => {
    await trackLinkClick('whatsapp', id, `https://wa.me/${WHATSAPP_NUMBER}`);
    
    const message = `Hi, I'm interested in the *${product.name}*. Can you provide more details?`;
    const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank');
  };

  // Handle email click
  const handleEmailClick = async () => {
    await trackLinkClick(
      'email',
      id,
      `mailto:${BUSINESS_EMAIL}?subject=Inquiry about ${product.name}`
    );
    window.location.href = `mailto:${BUSINESS_EMAIL}?subject=Inquiry about ${product.name}`;
  };

  // Handle phone click
  const handlePhoneClick = async () => {
    await trackLinkClick('phone', id, `tel:${BUSINESS_PHONE}`);
    window.location.href = `tel:${BUSINESS_PHONE}`;
  };

  return (
    <div className="product-detail-page py-12">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Product Image & Basic Info */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="product-image">
            <img src={product.image} alt={product.name} className="w-full rounded-lg" />
          </div>

          <div className="product-info">
            <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
            <p className="text-luxury-gold text-2xl font-semibold mb-4">
              ${product.price.toLocaleString()}
            </p>
            <p className="text-gray-600 mb-6">{product.description}</p>

            {/* Add to Cart Button */}
            <button className="w-full bg-luxury-gold text-white py-3 rounded-lg font-semibold mb-6 hover:bg-opacity-90 transition">
              Add to Cart
            </button>

            {/* Contact & Lead Gen CTA section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Have Questions?</h3>
              
              <div className="grid grid-cols-1 gap-3">
                {/* WhatsApp Button - Primary CTA */}
                <button
                  onClick={handleWhatsAppClick}
                  className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition"
                >
                  <FaWhatsapp size={20} />
                  Chat on WhatsApp
                </button>

                {/* Email Button */}
                <button
                  onClick={handleEmailClick}
                  className="flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition"
                >
                  <FaEnvelope size={20} />
                  Send Email Inquiry
                </button>

                {/* Phone Button */}
                <button
                  onClick={handlePhoneClick}
                  className="flex items-center justify-center gap-3 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-semibold transition"
                >
                  <FaPhone size={20} />
                  Call Us Now
                </button>
              </div>

              <p className="text-sm text-gray-500 text-center mt-4">
                Our team is available 24/7 to help you
              </p>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="product-details bg-gray-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Product Details</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Material</h4>
              <p className="text-gray-600">{product.material}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Warranty</h4>
              <p className="text-gray-600">{product.warranty}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Origin</h4>
              <p className="text-gray-600">{product.origin}</p>
            </div>
          </div>
        </div>

        {/* Inquiry Form Section */}
        <div className="inquiry-section mt-12 bg-luxury-gold bg-opacity-10 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-6">Send Us Your Inquiry</h2>
          <InquiryForm productId={id} productName={product.name} />
        </div>
      </div>
    </div>
  );
};

// Separate Inquiry Form Component
export const InquiryForm = ({ productId, productName }) => {
  const { trackAndSubmitForm } = useLinkClickTracking();
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Track the form submission
    await trackAndSubmitForm(
      formRef.current,
      'inquiry_form',
      productId
    );

    // Here you would normally send the form data to your backend
    // For now, we'll just submit the form
    formRef.current.submit();
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      action="/api/inquiries"
      method="POST"
      className="max-w-md"
    >
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productName" value={productName} />

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-luxury-gold"
          placeholder="Your name"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-luxury-gold"
          placeholder="your@email.com"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">Phone</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-luxury-gold"
          placeholder="+971 50 XXX XXXX"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">Message</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows="4"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-luxury-gold"
          placeholder="Tell us more about your inquiry..."
        ></textarea>
      </div>

      <button
        type="submit"
        className="w-full bg-luxury-gold hover:bg-opacity-90 text-white font-semibold py-3 rounded-lg transition"
      >
        Send Inquiry
      </button>
    </form>
  );
};

export default ProductDetail;
```

## Cart.jsx - Inquiry CTA Integration

```jsx
import { useLinkClickTracking } from '../hooks/useLinkClickTracking';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const Cart = () => {
  const cart = useSelector(state => state.cart.items);
  const { trackLinkClick } = useLinkClickTracking();
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleBulkInquiry = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Track the bulk inquiry
    await trackLinkClick(
      'inquiry_form',
      null, // No single product ID for bulk inquiry
      'bulk-inquiry'
    );

    // Create bulk inquiry message
    const productsList = cart.map(item => 
      `- ${item.name} (Qty: ${item.quantity}) - AED ${(item.price * item.quantity).toLocaleString()}`
    ).join('\n');

    const totalsList = `\nTotal: AED ${total.toLocaleString()}`;
    
    const message = `Hi, I'd like to inquire about these items:\n${productsList}${totalsList}`;
    const waLink = `https://wa.me/971XXXXXXX?text=${encodeURIComponent(message)}`;
    
    window.open(waLink, '_blank');
  };

  return (
    <div className="cart-page py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <a href="/shop" className="text-luxury-gold hover:underline">Continue Shopping</a>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="md:col-span-2">
              {cart.map(item => (
                <div key={item._id} className="flex gap-4 border-b pb-4 mb-4">
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="text-gray-600">AED {item.price}</p>
                    <p className="text-sm">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">AED {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary & CTAs */}
            <div className="bg-gray-50 p-6 rounded-lg h-fit">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="mb-6 border-b pb-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>AED {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping:</span>
                  <span>TBD</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>AED {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout - Link click tracked automatically by checkout page */}
              <a
                href="/checkout"
                className="block w-full bg-luxury-gold text-white text-center py-3 rounded-lg font-semibold mb-3 hover:bg-opacity-90 transition"
              >
                Proceed to Checkout
              </a>

              {/* Bulk Inquiry via WhatsApp - WITH tracking */}
              <button
                onClick={handleBulkInquiry}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
              >
                💬 Ask Questions via WhatsApp
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Not ready to checkout? Send us your questions first
              </p>
            </div>
          </div>
        )
        }
      </div>
    </div>
  );
};

export default Cart;
```

## Shop.jsx - ProductCard CTA Integration

```jsx
import { useLinkClickTracking } from '../hooks/useLinkClickTracking';

const ProductCard = ({ product }) => {
  const { trackLinkClick } = useLinkClickTracking();

  const handleQuickContact = async (e) => {
    e.stopPropagation();
    
    await trackLinkClick('inquiry_form', product._id, 'quick-contact');
    
    // Open a quick contact modal or form
    // Or redirect to product detail page with contact section visible
    window.location.href = `/product/${product._id}#contact`;
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition group">
      <div className="relative overflow-hidden aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
        />
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mb-4">
          <span className="text-luxury-gold font-bold text-xl">
            AED {product.price.toLocaleString()}
          </span>
          {product.inStock ? (
            <span className="text-green-600 text-sm font-semibold">In Stock</span>
          ) : (
            <span className="text-red-600 text-sm font-semibold">Out of Stock</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Add to Cart */}
          <button className="bg-luxury-gold text-white py-2 rounded hover:bg-opacity-90 transition font-semibold text-sm">
            Add to Cart
          </button>

          {/* Quick Contact - TRACKED */}
          <button
            onClick={handleQuickContact}
            className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition font-semibold text-sm"
          >
            💬 Ask Questions
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
```

## Checkout.jsx - Final CTA Integration

```jsx
import { useLinkClickTracking } from '../hooks/useLinkClickTracking';

const Checkout = () => {
  const { trackLinkClick } = useLinkClickTracking();
  const [orderData, setOrderData] = useState({...});

  const handleNeedHelp = async () => {
    // Track that user clicked for help during checkout
    await trackLinkClick('inquiry_form', null, 'checkout-help');
    
    window.open(
      `https://wa.me/971XXXXXXX?text=Hi, I need help with my checkout`,
      '_blank'
    );
  };

  return (
    <div className="checkout-page py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="md:col-span-2">
            {/* ... checkout form fields ... */}
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-gray-50 p-6 rounded-lg h-fit">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            {/* ... order details ... */}

            <button className="w-full bg-luxury-gold text-white py-3 rounded-lg font-bold mb-4">
              Place Order
            </button>

            {/* Help CTA */}
            <button
              onClick={handleNeedHelp}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
            >
              💬 Need Help? Chat with Us
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Our support team is available 24/7
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
```

## Copy-Paste Ready Buttons

Use these pre-built button components:

### WhatsApp Button
```jsx
<button
  onClick={() => trackAndNavigate(
    `https://wa.me/971XXXXXXX?text=${encodeURIComponent(message)}`,
    'whatsapp',
    productId
  )}
  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-semibold transition"
>
  <FaWhatsapp /> Chat on WhatsApp
</button>
```

### Email Button
```jsx
<button
  onClick={() => trackAndNavigate(
    `mailto:sales@sa3ati.com?subject=Inquiry about ${productName}`,
    'email',
    productId,
    false
  )}
  className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold transition"
>
  <FaEnvelope /> Send Email
</button>
```

### Phone Button
```jsx
<button
  onClick={() => trackAndNavigate(
    'tel:+971XXXXXXX',
    'phone',
    productId,
    false
  )}
  className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold transition"
>
  <FaPhone /> Call Now
</button>
```

## Testing the Integration

After implementing, test with:

```javascript
// 1. Open browser DevTools → Network tab
// 2. Click a tracked button
// 3. You should see POST request to `/api/link-clicks/track`
// 4. Check response (should be 200 OK)

// Dev console should show:
// ✓ Link click tracked: whatsapp
// { trackingId: '...' , timestamp: '2024-01-15T12:30:45Z' }
```

Then verify in admin dashboard at `/control-panel/link-clicks`
