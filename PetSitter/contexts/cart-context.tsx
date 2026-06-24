"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";
import type { Product } from "@/types/product";
import { getVariantOptions } from "@/lib/variants";

export interface CartItem extends Product {
  quantity: number;
  selectedVariant?: string;
}

const productKey = (productId: number | string, selectedVariant?: string) =>
  selectedVariant ? `${productId}_${selectedVariant}` : String(productId);

interface CartContextType {
  cart: CartItem[];
  hasLoadedCart: boolean;
  addToCart: (product: Product, quantity: number, selectedVariant?: string) => void;
  removeFromCart: (productId: number | string, selectedVariant?: string) => void;
  removeItemsFromCart: (itemKeys: Array<number | string>) => void;
  updateQuantity: (productId: number | string, quantity: number, selectedVariant?: string) => void;
  updateVariant: (productId: number | string, oldVariant: string, newVariant: string) => void;
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

  const addToCart = useCallback((product: Product, quantity: number, selectedVariant?: string) => {
    const finalVariant = selectedVariant || getVariantOptions(product.productName, product.categoryName)[0] || "Tiêu chuẩn";
    setCart((prevCart) => {
      const existingProductIndex = prevCart.findIndex(
        (item) => productKey(item.productId, item.selectedVariant) === productKey(product.productId, finalVariant)
      );

      if (existingProductIndex !== -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingProductIndex].quantity += quantity;
        return updatedCart;
      }

      return [...prevCart, { ...product, quantity, selectedVariant: finalVariant }];
    });
  }, []);

  const removeFromCart = useCallback((productId: number | string, selectedVariant?: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => productKey(item.productId, item.selectedVariant) !== productKey(productId, selectedVariant)
      )
    );
  }, []);

  const removeItemsFromCart = useCallback((itemKeys: Array<number | string>) => {
    const keysToRemove = new Set(itemKeys.map(String));
    setCart((prevCart) =>
      prevCart.filter((item) => !keysToRemove.has(productKey(item.productId, item.selectedVariant)))
    );
  }, []);

  const updateQuantity = useCallback((productId: number | string, quantity: number, selectedVariant?: string) => {
    const nextQuantity = Math.max(1, quantity);
    setCart((prevCart) =>
      prevCart.map((item) =>
        productKey(item.productId, item.selectedVariant) === productKey(productId, selectedVariant)
          ? { ...item, quantity: nextQuantity }
          : item
      )
    );
  }, []);

  const updateVariant = useCallback((productId: number | string, oldVariant: string, newVariant: string) => {
    setCart((prevCart) => {
      const oldIndex = prevCart.findIndex(
        (item) => productKey(item.productId, item.selectedVariant) === productKey(productId, oldVariant)
      );
      if (oldIndex === -1) return prevCart;

      const itemToUpdate = prevCart[oldIndex];
      const targetKey = productKey(productId, newVariant);

      const existingIndex = prevCart.findIndex(
        (item) => productKey(item.productId, item.selectedVariant) === targetKey
      );

      if (existingIndex !== -1 && existingIndex !== oldIndex) {
        const updatedCart = prevCart.map((item, idx) => {
          if (idx === existingIndex) {
            return { ...item, quantity: item.quantity + itemToUpdate.quantity };
          }
          return item;
        });
        return updatedCart.filter((_, idx) => idx !== oldIndex);
      } else {
        return prevCart.map((item, idx) => {
          if (idx === oldIndex) {
            return { ...item, selectedVariant: newVariant };
          }
          return item;
        });
      }
    });
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
        updateVariant,
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
