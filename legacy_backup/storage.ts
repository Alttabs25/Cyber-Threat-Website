// In-App Storage Service - SQLite Database Storage
// All data stored in SQLite with cross-platform support (web, iOS, Android)

import { Product } from "../data/products";
import { database } from "./database";

// ===================== INTERFACES =====================

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  profileImage?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  quantity: number;
  addedAt: string;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  productId: string;
  addedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  shippingInfo: ShippingInfo;
  paymentMethod: string;
}

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// ===================== IN-MEMORY STORAGE ARRAYS =====================

class StorageService {
  private currentUser: User | null = null;

  constructor() {
    this.loadCurrentUser();
  }

  // ===================== INITIALIZATION =====================

  private async loadCurrentUser() {
    try {
      const data = localStorage.getItem("app_current_user");
      if (data) this.currentUser = JSON.parse(data);
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  }

  private saveCurrentUser() {
    try {
      localStorage.setItem(
        "app_current_user",
        JSON.stringify(this.currentUser)
      );
    } catch (error) {
      console.error("Error saving current user:", error);
    }
  }

  // ===================== USER MANAGEMENT =====================

  async getAllUsers(): Promise<User[]> {
    const result = await database.query("SELECT * FROM users");
    return result || [];
  }

  async getUserById(userId: string): Promise<User | null> {
    const result = await database.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    return result && result.length > 0 ? result[0] : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const trimmedEmail = email.trim().toLowerCase();
    console.log("[getUserByEmail] Querying for:", trimmedEmail);
    const result = await database.query(
      "SELECT * FROM users WHERE LOWER(email) = ?",
      [trimmedEmail]
    );
    console.log("[getUserByEmail] Query result:", result);
    return result && result.length > 0 ? result[0] : null;
  }

  async createUser(userData: Omit<User, "id" | "createdAt">): Promise<User> {
    try {
      // Normalize email to lowercase
      const normalizedEmail = userData.email.trim().toLowerCase();

      const newUser: User = {
        id: `USER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...userData,
        email: normalizedEmail,
        createdAt: new Date().toISOString(),
      };

      console.log("createUser inserting", newUser);

      await database.run(
        "INSERT INTO users (id, name, email, password, profileImage, phone, address, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          newUser.id,
          newUser.name,
          newUser.email,
          newUser.password,
          newUser.profileImage || null,
          newUser.phone || null,
          newUser.address || null,
          newUser.createdAt,
        ]
      );

      return newUser;
    } catch (error) {
      console.error("Create user error in storage service:", error);
      throw error;
    }
  }

  async updateUser(
    userId: string,
    updates: Partial<User>
  ): Promise<User | null> {
    const user = await this.getUserById(userId);
    if (!user) return null;

    const updatedUser = { ...user, ...updates };

    await database.run(
      "UPDATE users SET name = ?, email = ?, password = ?, profileImage = ?, phone = ?, address = ? WHERE id = ?",
      [
        updatedUser.name,
        updatedUser.email,
        updatedUser.password,
        updatedUser.profileImage || null,
        updatedUser.phone || null,
        updatedUser.address || null,
        userId,
      ]
    );

    if (this.currentUser?.id === userId) {
      this.currentUser = updatedUser;
      this.saveCurrentUser();
    }

    return updatedUser;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await database.run("DELETE FROM users WHERE id = ?", [
      userId,
    ]);
    return result.changes && result.changes.changes > 0;
  }

  // ===================== AUTHENTICATION =====================

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  setCurrentUser(user: User | null) {
    this.currentUser = user;
    this.saveCurrentUser();
  }

  async login(email: string, password: string): Promise<User | null> {
    try {
      // Normalize email for case-insensitive comparison
      const normalizedEmail = email.trim().toLowerCase();

      const result = await database.query(
        "SELECT * FROM users WHERE LOWER(TRIM(email)) = ? AND password = ?",
        [normalizedEmail, password]
      );

      if (result && result.length > 0) {
        this.currentUser = result[0];
        this.saveCurrentUser();
        return result[0];
      }
      return null;
    } catch (error) {
      console.error("Login error in storage service:", error);
      return null;
    }
  }

  logout() {
    this.currentUser = null;
    this.saveCurrentUser();
  }

  // ===================== CART MANAGEMENT =====================

  async getCartItems(userId: string): Promise<CartItem[]> {
    const result = await database.query(
      "SELECT * FROM cart_items WHERE userId = ?",
      [userId]
    );

    // Note: product data needs to be fetched separately or joined
    // For now, returning cart items without full product details
    return result || [];
  }

  async addToCart(
    userId: string,
    product: Product,
    quantity: number = 1
  ): Promise<CartItem> {
    const existing = await database.query(
      "SELECT * FROM cart_items WHERE userId = ? AND productId = ?",
      [userId, product.id]
    );

    if (existing && existing.length > 0) {
      const newQuantity = existing[0].quantity + quantity;
      await database.run("UPDATE cart_items SET quantity = ? WHERE id = ?", [
        newQuantity,
        existing[0].id,
      ]);
      return { ...existing[0], quantity: newQuantity, product };
    }

    const newCartItem: CartItem = {
      id: `CART_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      productId: product.id,
      product,
      quantity,
      addedAt: new Date().toISOString(),
    };

    await database.run(
      "INSERT INTO cart_items (id, userId, productId, quantity, addedAt) VALUES (?, ?, ?, ?, ?)",
      [newCartItem.id, userId, product.id, quantity, newCartItem.addedAt]
    );

    return newCartItem;
  }

  async updateCartItemQuantity(
    cartItemId: string,
    quantity: number
  ): Promise<CartItem | null> {
    if (quantity <= 0) {
      return await this.removeFromCart(cartItemId);
    }

    await database.run("UPDATE cart_items SET quantity = ? WHERE id = ?", [
      quantity,
      cartItemId,
    ]);

    const result = await database.query(
      "SELECT * FROM cart_items WHERE id = ?",
      [cartItemId]
    );
    return result && result.length > 0 ? result[0] : null;
  }

  async removeFromCart(cartItemId: string): Promise<CartItem | null> {
    const result = await database.query(
      "SELECT * FROM cart_items WHERE id = ?",
      [cartItemId]
    );
    const item = result && result.length > 0 ? result[0] : null;

    if (item) {
      await database.run("DELETE FROM cart_items WHERE id = ?", [cartItemId]);
    }

    return item;
  }

  async clearCart(userId: string): Promise<void> {
    await database.run("DELETE FROM cart_items WHERE userId = ?", [userId]);
  }

  async getCartTotal(userId: string): Promise<number> {
    // This requires product data - will need to be calculated from cart items + product data
    const items = await this.getCartItems(userId);
    // Simplified - in production you'd join with product data
    return 0;
  }

  async getCartCount(userId: string): Promise<number> {
    const result = await database.query(
      "SELECT SUM(quantity) as total FROM cart_items WHERE userId = ?",
      [userId]
    );
    return result && result[0] && result[0].total ? result[0].total : 0;
  }

  // ===================== FAVORITES MANAGEMENT =====================

  async getFavoriteItems(userId: string): Promise<FavoriteItem[]> {
    const result = await database.query(
      "SELECT * FROM favorites WHERE userId = ?",
      [userId]
    );
    return result || [];
  }

  async getFavoriteProductIds(userId: string): Promise<string[]> {
    const items = await this.getFavoriteItems(userId);
    return items.map((item: FavoriteItem) => item.productId);
  }

  async addToFavorites(
    userId: string,
    productId: string
  ): Promise<FavoriteItem> {
    const existing = await database.query(
      "SELECT * FROM favorites WHERE userId = ? AND productId = ?",
      [userId, productId]
    );

    if (existing && existing.length > 0) {
      return existing[0];
    }

    const newFavorite: FavoriteItem = {
      id: `FAV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      productId,
      addedAt: new Date().toISOString(),
    };

    await database.run(
      "INSERT INTO favorites (id, userId, productId, addedAt) VALUES (?, ?, ?, ?)",
      [newFavorite.id, userId, productId, newFavorite.addedAt]
    );

    return newFavorite;
  }

  async removeFromFavorites(
    userId: string,
    productId: string
  ): Promise<boolean> {
    const result = await database.run(
      "DELETE FROM favorites WHERE userId = ? AND productId = ?",
      [userId, productId]
    );
    return result.changes && result.changes.changes > 0;
  }

  async toggleFavorite(userId: string, productId: string): Promise<boolean> {
    const isFav = await this.isFavorite(userId, productId);

    if (isFav) {
      await this.removeFromFavorites(userId, productId);
      return false;
    } else {
      await this.addToFavorites(userId, productId);
      return true;
    }
  }

  async isFavorite(userId: string, productId: string): Promise<boolean> {
    const result = await database.query(
      "SELECT id FROM favorites WHERE userId = ? AND productId = ?",
      [userId, productId]
    );
    return result && result.length > 0;
  }

  // ===================== ORDER MANAGEMENT =====================

  async getAllOrders(userId: string): Promise<Order[]> {
    const result = await database.query(
      "SELECT * FROM orders WHERE userId = ? ORDER BY date DESC",
      [userId]
    );

    if (!result || result.length === 0) return [];

    // Fetch order items for each order
    const orders = await Promise.all(
      result.map(async (order: any) => {
        const items = await this.getOrderItems(order.id);
        return {
          ...order,
          items,
          shippingInfo: JSON.parse(order.shippingAddress),
        };
      })
    );

    return orders;
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    const result = await database.query("SELECT * FROM orders WHERE id = ?", [
      orderId,
    ]);

    if (!result || result.length === 0) return null;

    const order = result[0];
    const items = await this.getOrderItems(orderId);

    return {
      ...order,
      items,
      shippingInfo: JSON.parse(order.shippingAddress),
    };
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const result = await database.query(
      "SELECT * FROM order_items WHERE orderId = ?",
      [orderId]
    );
    return result || [];
  }

  async createOrder(
    userId: string,
    cartItems: CartItem[],
    shippingInfo: ShippingInfo,
    paymentMethod: string,
    subtotal: number,
    shipping: number,
    tax: number,
    total: number
  ): Promise<Order> {
    const orderId = `ORD_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create order items
    const items: OrderItem[] = [];
    for (const cartItem of cartItems) {
      const orderItem: OrderItem = {
        id: `ORDITEM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderId,
        productId: cartItem.productId,
        name: cartItem.product.name,
        price: cartItem.product.price,
        quantity: cartItem.quantity,
        image: cartItem.product.image,
      };

      await database.run(
        "INSERT INTO order_items (id, orderId, productId, name, price, quantity, image) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          orderItem.id,
          orderId,
          cartItem.productId,
          cartItem.product.name,
          cartItem.product.price,
          cartItem.quantity,
          cartItem.product.image,
        ]
      );

      items.push(orderItem);
    }

    // Create order
    await database.run(
      "INSERT INTO orders (id, userId, date, subtotal, tax, shipping, total, status, shippingAddress, paymentMethod) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        orderId,
        userId,
        new Date().toISOString(),
        subtotal,
        tax,
        shipping,
        total,
        "Delivered",
        JSON.stringify(shippingInfo),
        paymentMethod,
      ]
    );

    const newOrder: Order = {
      id: orderId,
      userId,
      date: new Date().toISOString(),
      items,
      subtotal,
      shipping,
      tax,
      total,
      status: "Delivered",
      shippingInfo,
      paymentMethod,
    };

    return newOrder;
  }

  async updateOrderStatus(
    orderId: string,
    status: string
  ): Promise<Order | null> {
    await database.run("UPDATE orders SET status = ? WHERE id = ?", [
      status,
      orderId,
    ]);
    return await this.getOrderById(orderId);
  }

  // ===================== UTILITY METHODS =====================

  async clearAllData(): Promise<void> {
    await database.execute(`
      DELETE FROM users;
      DELETE FROM cart_items;
      DELETE FROM favorites;
      DELETE FROM orders;
      DELETE FROM order_items;
    `);
    this.currentUser = null;
    this.saveCurrentUser();
  }

  async exportData() {
    const users = await this.getAllUsers();
    // Note: Would need userId to export user-specific data
    return {
      users,
      currentUser: this.currentUser,
    };
  }

  async getStats(userId: string) {
    const orders = await this.getAllOrders(userId);
    const favorites = await this.getFavoriteItems(userId);
    const cartCount = await this.getCartCount(userId);
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

    return {
      totalOrders: orders.length,
      totalFavorites: favorites.length,
      cartItemsCount: cartCount,
      totalSpent,
    };
  }

  async clearAllUsers(): Promise<void> {
    await database.run("DELETE FROM users", []);
    this.currentUser = null;
    this.saveCurrentUser();
    console.log("All users cleared from database.");
  }

  // ===================== DEBUG HELPERS =====================

  async debugListUsers(): Promise<void> {
    const users = await this.getAllUsers();
    console.log("[DEBUG] Total users in database:", users.length);
    users.forEach((user, index) => {
      console.log(`[DEBUG] User ${index + 1}:`, {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordLength: user.password.length,
        isHashed: user.password.length === 64,
        createdAt: user.createdAt,
      });
    });
    return;
  }
}

// Create singleton instance
const storageService = new StorageService();

// Expose debug helpers to window for browser console access
if (typeof window !== "undefined") {
  (window as any).debugAuth = {
    listUsers: () => storageService.debugListUsers(),
    clearAllUsers: () => storageService.clearAllUsers(),
    clearAllData: () => storageService.clearAllData(),
  };
  console.log("[STORAGE] Debug helpers available: window.debugAuth");
}

export default storageService;
