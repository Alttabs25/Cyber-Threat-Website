import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Product, products } from "../data/products";
import { assertSupabaseConfigured, supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

export type BoxSize = "small" | "regular" | "large";

export interface CartItem {
  product: Product;
  quantity: number;
  boxSize?: BoxSize;
  price?: number;
}

interface CartContextType {
  cart: CartItem[];
  wishlist: string[];
  isCartLoading: boolean;
  addToCart: (
    product: Product,
    quantity?: number,
    boxSize?: BoxSize,
    price?: number
  ) => Promise<boolean>;
  removeFromCart: (productId: string, boxSize?: BoxSize) => Promise<void>;
  updateQuantity: (
    productId: string,
    quantity: number,
    boxSize?: BoxSize
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartCount: () => number;
  toggleWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const priceFor = (product: Product, boxSize: BoxSize) =>
  product.boxPrices?.[boxSize] ?? product.price;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const history = useHistory();
  const { user, isAuthReady } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadUserData = async () => {
      if (!isAuthReady) return;

      if (!user) {
        setCart([]);
        setWishlist([]);
        setIsCartLoading(false);
        localStorage.removeItem("guestCart");
        localStorage.removeItem("guestWishlist");
        return;
      }

      setIsCartLoading(true);
      const [cartResult, favoritesResult] = await Promise.all([
        supabase
          .from("cart_items")
          .select("product_id, quantity, box_size")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("favorites")
          .select("product_id")
          .eq("user_id", user.id),
      ]);

      if (!active) return;
      if (cartResult.error)
        console.error("Unable to load cart:", cartResult.error.message);
      if (favoritesResult.error)
        console.error("Unable to load favorites:", favoritesResult.error.message);

      setCart(
        (cartResult.data || []).flatMap((row) => {
          const product = products.find((item) => item.id === row.product_id);
          if (!product) return [];
          const boxSize = (row.box_size || "regular") as BoxSize;
          return [
            {
              product,
              quantity: row.quantity,
              boxSize,
              price: priceFor(product, boxSize),
            },
          ];
        })
      );
      setWishlist((favoritesResult.data || []).map((row) => row.product_id));
      setIsCartLoading(false);
    };

    void loadUserData();
    return () => {
      active = false;
    };
  }, [user, isAuthReady]);

  const requireUser = () => {
    if (user) return user;
    const returnTo = `${window.location.pathname}${window.location.search}`;
    history.push({
      pathname: "/login",
      search: `?returnTo=${encodeURIComponent(returnTo)}`,
    });
    return null;
  };

  const addToCart = async (
    product: Product,
    quantity = 1,
    boxSize: BoxSize = "regular",
    price?: number
  ) => {
    const currentUser = requireUser();
    if (!currentUser) return false;
    assertSupabaseConfigured();

    const existing = cart.find(
      (item) => item.product.id === product.id && item.boxSize === boxSize
    );
    const nextQuantity = (existing?.quantity || 0) + quantity;
    const { error } = await supabase.from("cart_items").upsert(
      {
        user_id: currentUser.id,
        product_id: product.id,
        box_size: boxSize,
        quantity: nextQuantity,
      },
      { onConflict: "user_id,product_id,box_size" }
    );
    if (error) {
      console.error("Unable to add to cart:", error.message);
      return false;
    }

    setCart((current) => {
      const item = {
        product,
        quantity: nextQuantity,
        boxSize,
        price: price ?? priceFor(product, boxSize),
      };
      return existing
        ? current.map((entry) =>
            entry.product.id === product.id && entry.boxSize === boxSize
              ? item
              : entry
          )
        : [...current, item];
    });
    return true;
  };

  const removeFromCart = async (productId: string, boxSize?: BoxSize) => {
    const currentUser = requireUser();
    if (!currentUser) return;

    let query = supabase
      .from("cart_items")
      .delete()
      .eq("user_id", currentUser.id)
      .eq("product_id", productId);
    if (boxSize) query = query.eq("box_size", boxSize);
    const { error } = await query;
    if (error) {
      console.error("Unable to remove cart item:", error.message);
      return;
    }
    setCart((current) =>
      current.filter((item) =>
        boxSize
          ? !(item.product.id === productId && item.boxSize === boxSize)
          : item.product.id !== productId
      )
    );
  };

  const updateQuantity = async (
    productId: string,
    quantity: number,
    boxSize: BoxSize = "regular"
  ) => {
    const currentUser = requireUser();
    if (!currentUser) return;
    if (quantity <= 0) return removeFromCart(productId, boxSize);

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("user_id", currentUser.id)
      .eq("product_id", productId)
      .eq("box_size", boxSize);
    if (error) {
      console.error("Unable to update cart:", error.message);
      return;
    }
    setCart((current) =>
      current.map((item) =>
        item.product.id === productId && item.boxSize === boxSize
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = async () => {
    const currentUser = requireUser();
    if (!currentUser) return;
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", currentUser.id);
    if (error) {
      console.error("Unable to clear cart:", error.message);
      return;
    }
    setCart([]);
  };

  const toggleWishlist = async (productId: string) => {
    const currentUser = requireUser();
    if (!currentUser) return false;
    const exists = wishlist.includes(productId);
    const query = exists
      ? supabase
          .from("favorites")
          .delete()
          .eq("user_id", currentUser.id)
          .eq("product_id", productId)
      : supabase
          .from("favorites")
          .insert({ user_id: currentUser.id, product_id: productId });
    const { error } = await query;
    if (error) {
      console.error("Unable to update favorites:", error.message);
      return false;
    }
    setWishlist((current) =>
      exists ? current.filter((id) => id !== productId) : [...current, productId]
    );
    return true;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        isCartLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal: () =>
          cart.reduce(
            (total, item) =>
              total + (item.price ?? item.product.price) * item.quantity,
            0
          ),
        getCartCount: () =>
          cart.reduce((total, item) => total + item.quantity, 0),
        toggleWishlist,
        isInWishlist: (productId) => wishlist.includes(productId),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
