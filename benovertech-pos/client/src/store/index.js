import { create } from 'zustand';

export const usePOSStore = create((set) => ({
  businessInfo: {
    name: 'BENOVERTECH GADGETS',
    address: '14 Benson Ojukwu Street, Canal Estate, Ago Palace Lagos',
    phone: '08107271610',
    email: 'benovertech@gmail.com'
  },
  
  cart: [],
  addToCart: (product) => set((state) => {
    const existing = state.cart.find(item => item.id === product.id);
    if (existing) {
      return {
        cart: state.cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      };
    }
    return { cart: [...state.cart, { ...product, quantity: 1 }] };
  }),
  
  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter(item => item.id !== productId),
  })),
  
  updateCartQuantity: (productId, quantity) => set((state) => ({
    cart: state.cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    ).filter(item => item.quantity > 0),
  })),
  
  clearCart: () => set({ cart: [] }),
  
  getCartTotal: () => {
    // This will be computed in the component
  },
}));

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  theme: 'light',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));
