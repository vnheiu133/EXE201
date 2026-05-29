"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Product } from "@/types/product";

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number | string) => void;
  updateQuantity: (productId: number | string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load giỏ hàng từ localStorage khi component mount (chỉ client)
  useEffect(() => {
    if (typeof window === "undefined") return; // ✅ đảm bảo không chạy khi SSR
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch {
        console.warn("Failed to parse cart data from localStorage");
      }
    }
  }, []);

  // Lưu giỏ hàng vào localStorage mỗi khi nó thay đổi (chỉ client)
  useEffect(() => {
    if (typeof window === "undefined") return; // ✅ thêm check này nữa
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((product: Product, quantity: number) => {
    setCart((prevCart) => {
      const existingProductIndex = prevCart.findIndex(
        (item) => item.productId === product.productId
      );

      if (existingProductIndex !== -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingProductIndex].quantity += quantity;
        return updatedCart;
      } else {
        return [...prevCart, { ...product, quantity }];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId: number | string) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number | string, quantity: number) => {
    const nextQuantity = Math.max(1, quantity);
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId ? { ...item, quantity: nextQuantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("cart"); // ✅ clear luôn localStorage
    }
  }, []);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
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
