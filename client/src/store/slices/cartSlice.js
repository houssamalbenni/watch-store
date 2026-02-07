import { createSlice } from '@reduxjs/toolkit';

// Load from localStorage
const loadCart = () => {
  try {
    const data = localStorage.getItem('sa3ati_cart');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  localStorage.setItem('sa3ati_cart', JSON.stringify(items));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCart(),
  },
  reducers: {
    addToCart: (state, { payload }) => {
      const existing = state.items.find((i) => i.productId === payload.productId);
      if (existing) {
        existing.qty += payload.qty || 1;
      } else {
        state.items.push({ ...payload, qty: payload.qty || 1 });
      }
      saveCart(state.items);
    },
    removeFromCart: (state, { payload }) => {
      state.items = state.items.filter((i) => i.productId !== payload);
      saveCart(state.items);
    },
    updateQty: (state, { payload: { productId, qty } }) => {
      const item = state.items.find((i) => i.productId === productId);
      if (item) {
        item.qty = Math.max(1, qty);
        saveCart(state.items);
      }
    },
    clearCart: (state) => {
      state.items = [];
      saveCart([]);
    },
  },
});

export const { addToCart, removeFromCart, updateQty, clearCart } = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => state.cart.items.reduce((sum, i) => sum + i.qty, 0);
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + (i.discountPrice || i.price) * i.qty, 0);

export default cartSlice.reducer;
