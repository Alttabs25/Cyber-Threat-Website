import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "../data/products";
import storageService from "../services/storage";
import { useAuth } from "./AuthContext";

export interface CartItem {
  product: Product;
  quantity: number;
  boxSize?: "small" | "regular" | "large";
  price?: number;
}

interface CartContextType {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (
    product: Product,
    quantity?: number,
    boxSize?: "small" | "regular" | "large",
    price?: number
  ) => void;
  removeFromCart: (
    productId: string,
    boxSize?: "small" | "regular" | "large"
  ) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    boxSize?: "small" | "regular" | "large"
  ) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Load cart and wishlist from localStorage on mount (guest data)
  useEffect(() => {
    const savedCart = localStorage.getItem("guestCart");
    const savedWishlist = localStorage.getItem("guestWishlist");

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }
    }

    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (error) {
        console.error("Error loading wishlist from localStorage:", error);
      }
    }

    setIsInitialized(true);
  }, []);

  // Save cart to localStorage for guest (after initialization)
  useEffect(() => {
    if (isInitialized && !user) {
      localStorage.setItem("guestCart", JSON.stringify(cart));
    }
  }, [cart, isInitialized, user]);

  // Save wishlist to localStorage for guest (after initialization)
  useEffect(() => {
    if (isInitialized && !user) {
      localStorage.setItem("guestWishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, isInitialized, user]);

  // Handle user login/logout - load user-specific cart and wishlist
  useEffect(() => {
    const handleUserChange = async () => {
      if (!isInitialized) return;

      // User logged in
      if (user && user.id !== currentUserId) {
        // Save current cart/wishlist to previous user's storage if there was a user
        if (currentUserId) {
          const userCartKey = `userCart_${currentUserId}`;
          const userWishlistKey = `userWishlist_${currentUserId}`;
          localStorage.setItem(userCartKey, JSON.stringify(cart));
          localStorage.setItem(userWishlistKey, JSON.stringify(wishlist));
        }

        // Load new user's cart and wishlist from localStorage
        const userCartKey = `userCart_${user.id}`;
        const userWishlistKey = `userWishlist_${user.id}`;
        const savedUserCart = localStorage.getItem(userCartKey);
        const savedUserWishlist = localStorage.getItem(userWishlistKey);

        if (savedUserCart) {
          try {
            setCart(JSON.parse(savedUserCart));
          } catch (error) {
            console.error("Error loading user cart:", error);
            setCart([]);
          }
        } else {
          // Try loading from storage service
          const cartItems = await storageService.getCartItems(user.id);
          if (cartItems.length > 0) {
            const formattedCart: CartItem[] = cartItems.map((item) => ({
              product: item.product,
              quantity: item.quantity,
            }));
            setCart(formattedCart);
          } else {
            setCart([]);
          }
        }

        if (savedUserWishlist) {
          try {
            setWishlist(JSON.parse(savedUserWishlist));
          } catch (error) {
            console.error("Error loading user wishlist:", error);
            setWishlist([]);
          }
        } else {
          // Try loading from storage service
          const favoriteIds = await storageService.getFavoriteProductIds(
            user.id
          );
          if (favoriteIds.length > 0) {
            setWishlist(favoriteIds);
          } else {
            setWishlist([]);
          }
        }

        setCurrentUserId(user.id);
      }
      // User logged out
      else if (!user && currentUserId) {
        // Save logged out user's cart and wishlist
        const userCartKey = `userCart_${currentUserId}`;
        const userWishlistKey = `userWishlist_${currentUserId}`;
        localStorage.setItem(userCartKey, JSON.stringify(cart));
        localStorage.setItem(userWishlistKey, JSON.stringify(wishlist));

        // Clear current user ID first to prevent saves
        setCurrentUserId(null);

        // Then clear cart and wishlist on logout
        setCart([]);
        setWishlist([]);

        // Clear guest data as well
        localStorage.removeItem("guestCart");
        localStorage.removeItem("guestWishlist");
      }
    };

    handleUserChange();
  }, [user, isInitialized]);

  // Save user's cart to their specific localStorage key
  useEffect(() => {
    // Only save if user is logged in AND currentUserId matches (prevents saving during logout)
    if (isInitialized && user && currentUserId && currentUserId === user.id) {
      const userCartKey = `userCart_${user.id}`;
      localStorage.setItem(userCartKey, JSON.stringify(cart));
    }
  }, [cart, isInitialized, user, currentUserId]);

  // Save user's wishlist to their specific localStorage key
  useEffect(() => {
    // Only save if user is logged in AND currentUserId matches (prevents saving during logout)
    if (isInitialized && user && currentUserId && currentUserId === user.id) {
      const userWishlistKey = `userWishlist_${user.id}`;
      localStorage.setItem(userWishlistKey, JSON.stringify(wishlist));
    }
  }, [wishlist, isInitialized, user, currentUserId]);

  const addToCart = async (
    product: Product,
    quantity: number = 1,
    boxSize: "small" | "regular" | "large" = "regular",
    price?: number
  ) => {
    try {
      const itemPrice = price || product.price;

      // Update local state
      setCart((prevCart) => {
        const existingItem = prevCart.find(
          (item) => item.product.id === product.id && item.boxSize === boxSize
        );
        if (existingItem) {
          return prevCart.map((item) =>
            item.product.id === product.id && item.boxSize === boxSize
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prevCart, { product, quantity, boxSize, price: itemPrice }];
      });

      // Also save to storage service if user is logged in
      if (user) {
        await storageService.addToCart(user.id, product, quantity);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const removeFromCart = async (
    productId: string,
    boxSize?: "small" | "regular" | "large"
  ) => {
    try {
      // Update local state - remove specific item by productId and boxSize
      setCart((prevCart) =>
        prevCart.filter((item) =>
          boxSize
            ? !(item.product.id === productId && item.boxSize === boxSize)
            : item.product.id !== productId
        )
      );

      // Also remove from storage service if user is logged in
      if (user) {
        const cartItems = await storageService.getCartItems(user.id);
        const itemToRemove = cartItems.find(
          (item) => item.product.id === productId
        );

        if (itemToRemove) {
          await storageService.removeFromCart(itemToRemove.id);
        }
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const updateQuantity = async (
    productId: string,
    quantity: number,
    boxSize?: "small" | "regular" | "large"
  ) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(productId, boxSize);
        return;
      }

      // Update local state - update specific item by productId and boxSize
      setCart((prevCart) =>
        prevCart.map((item) =>
          boxSize
            ? item.product.id === productId && item.boxSize === boxSize
              ? { ...item, quantity }
              : item
            : item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      );

      // Also update in storage service if user is logged in
      if (user) {
        const cartItems = await storageService.getCartItems(user.id);
        const itemToUpdate = cartItems.find(
          (item) => item.product.id === productId
        );

        if (itemToUpdate) {
          await storageService.updateCartItemQuantity(
            itemToUpdate.id,
            quantity
          );
        }
      }
    } catch (error) {
      console.error("Error updating cart quantity:", error);
    }
  };

  const clearCart = async () => {
    try {
      // Update local state
      setCart([]);

      // Also clear from storage service if user is logged in
      if (user) {
        await storageService.clearCart(user.id);
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) =>
        total + (item.price || item.product.price) * item.quantity,
      0
    );
  };

  const getCartCount = () => {
    return cart.length;
  };

  const toggleWishlist = async (productId: string) => {
    try {
      // Update local state
      setWishlist((prevWishlist) => {
        if (prevWishlist.includes(productId)) {
          return prevWishlist.filter((id) => id !== productId);
        }
        return [...prevWishlist, productId];
      });

      // Also save to storage service if user is logged in
      if (user) {
        await storageService.toggleFavorite(user.id, productId);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
