import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import api from '../api';
import { Cart, CartItem } from '../types';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface CartContextType {
  cartItems: CartItem[];
  cartTotal: number;
  itemCount: number;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const { isAuthenticated } = useAuth();

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      setCartTotal(0);
      setItemCount(0);
      return;
    }
    try {
      const response = await api.get<Cart>('/cart');
      setCartItems(response.data.items);
      setCartTotal(response.data.totalPrice);
      setItemCount(response.data.itemCount);
    } catch {
      console.error('Failed to fetch cart');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: number, quantity: number) => {
    try {
      const response = await api.post<Cart>('/cart/items', { productId, quantity });
      setCartItems(response.data.items);
      setCartTotal(response.data.totalPrice);
      setItemCount(response.data.itemCount);
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      const response = await api.put<Cart>(`/cart/items/${itemId}`, { productId: 0, quantity });
      setCartItems(response.data.items);
      setCartTotal(response.data.totalPrice);
      setItemCount(response.data.itemCount);
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      const response = await api.delete<Cart>(`/cart/items/${itemId}`);
      setCartItems(response.data.items);
      setCartTotal(response.data.totalPrice);
      setItemCount(response.data.itemCount);
      toast.success('Removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setCartTotal(0);
    setItemCount(0);
  };

  return (
    <CartContext.Provider value={{ cartItems, cartTotal, itemCount, addToCart, updateQuantity, removeFromCart, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
