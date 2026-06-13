"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";
import type { Product } from "@/types/product";

export interface CartItem extends Product {
  quantity: number;
}

const productKey = (productId: number | string) => String(productId);

interface CartContextType {
  cart: CartItem[];
  hasLoadedCart: boolean;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number | string) => void;
  removeItemsFromCart: (productIds: Array<number | string>) => void;
  updateQuantity: (productId: number | string, quantity: number) => void;
  clearCart: () => void;
  checkoutStorageKey: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);

  const cartStorageKey = user?.userId ? `cart:${user.userId}` : "cart:guest";
  const checkoutStorageKey = user?.userId ? `checkoutCartItems:${user.userId}` : "checkoutCartItems:guest";

  useEffect(() => {
    if (typeof window === "undefined") return;

    setHasLoadedCart(false);
    const storedCart = localStorage.getItem(cartStorageKey);

    if (!storedCart) {
      setCart([]);
      setHasLoadedCart(true);
      return;
    }

    try {
      setCart(JSON.parse(storedCart));
    } catch {
      console.warn("Failed to parse cart data from localStorage");
      setCart([]);
    } finally {
      setHasLoadedCart(true);
    }
  }, [cartStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined" || !hasLoadedCart) return;
    localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  }, [cart, cartStorageKey, hasLoadedCart]);

  const addToCart = useCallback((product: Product, quantity: number) => {
    setCart((prevCart) => {
      const existingProductIndex = prevCart.findIndex((item) => productKey(item.productId) === productKey(product.productId));

      if (existingProductIndex !== -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingProductIndex].quantity += quantity;
        return updatedCart;
      }

      return [...prevCart, { ...product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: number | string) => {
    setCart((prevCart) => prevCart.filter((item) => productKey(item.productId) !== productKey(productId)));
  }, []);

  const removeItemsFromCart = useCallback((productIds: Array<number | string>) => {
    const idsToRemove = new Set(productIds.map(String));
    setCart((prevCart) => prevCart.filter((item) => !idsToRemove.has(String(item.productId))));
  }, []);

  const updateQuantity = useCallback((productId: number | string, quantity: number) => {
    const nextQuantity = Math.max(1, quantity);
    setCart((prevCart) =>
      prevCart.map((item) => (productKey(item.productId) === productKey(productId) ? { ...item, quantity: nextQuantity } : item)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(cartStorageKey);
    }
  }, [cartStorageKey]);

  return (
    <CartContext.Provider
      value={{
        cart,
        hasLoadedCart,
        addToCart,
        removeFromCart,
        removeItemsFromCart,
        updateQuantity,
        clearCart,
        checkoutStorageKey,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
