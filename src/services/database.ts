// SQLite Database Service
// Handles database initialization and connection management for web and native platforms
// Web platform uses localStorage, native platforms use SQLite

import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import { Capacitor } from "@capacitor/core";

// LocalStorage keys for web platform
const STORAGE_KEYS = {
  USERS: "cookie_app_users",
  CART_ITEMS: "cookie_app_cart_items",
  FAVORITES: "cookie_app_favorites",
  ORDERS: "cookie_app_orders",
  ORDER_ITEMS: "cookie_app_order_items",
};

interface QueryResult {
  values?: any[];
}

class DatabaseService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private platform: string;
  private dbName: string = "cookie_app.db";
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.platform = Capacitor.getPlatform();
  }

  /**
   * Initialize the database connection and create tables
   * Handles both web and native platforms
   */
  async initialize(): Promise<void> {
    // Prevent multiple simultaneous initializations
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    if (this.isInitialized) {
      console.log("Database already initialized");
      return;
    }

    this.initializationPromise = this._initialize();

    try {
      await this.initializationPromise;
    } finally {
      this.initializationPromise = null;
    }
  }

  private async _initialize(): Promise<void> {
    try {
      console.log("Database initialization started, platform:", this.platform);

      // Handle web platform separately - use localStorage
      if (this.platform === "web") {
        console.log("Web platform detected - initializing localStorage");
        this.initializeLocalStorage();
        this.isInitialized = true;
        return;
      }

      // Native platform initialization
      console.log("Initializing native platform database...");

      // Check connection consistency
      const consistencyCheck = await this.sqlite.checkConnectionsConsistency();
      console.log("Connection consistency check:", consistencyCheck.result);

      // Check if connection already exists
      const connectionExists = await this.sqlite.isConnection(
        this.dbName,
        false
      );
      console.log("Connection exists:", connectionExists.result);

      if (consistencyCheck.result && connectionExists.result) {
        console.log("Retrieving existing connection...");
        this.db = await this.sqlite.retrieveConnection(this.dbName, false);
      } else {
        console.log("Creating new connection...");
        this.db = await this.sqlite.createConnection(
          this.dbName,
          false,
          "no-encryption",
          1,
          false
        );
      }

      // Open the database
      console.log("Opening database...");
      await this.db.open();

      // Create tables
      console.log("Creating tables...");
      await this.createTables();

      this.isInitialized = true;
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Error initializing database:", error);
      this.isInitialized = false;
      this.db = null;
      throw new Error(
        `Failed to initialize database: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Initialize localStorage structure for web platform
   */
  private initializeLocalStorage(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify([]));
      }
    });
    console.log("LocalStorage initialized");
  }

  /**
   * Create database tables and indexes (native only)
   */
  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error("Database connection not established");
    }

    const createTablesSQL = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        profileImage TEXT,
        phone TEXT,
        address TEXT,
        createdAt TEXT NOT NULL
      );

      -- Cart items table
      CREATE TABLE IF NOT EXISTS cart_items (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        productId TEXT NOT NULL,
        quantity INTEGER NOT NULL CHECK(quantity > 0),
        addedAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Favorites table
      CREATE TABLE IF NOT EXISTS favorites (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        productId TEXT NOT NULL,
        addedAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(userId, productId)
      );

      -- Orders table
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        date TEXT NOT NULL,
        subtotal REAL NOT NULL CHECK(subtotal >= 0),
        tax REAL NOT NULL CHECK(tax >= 0),
        shipping REAL NOT NULL CHECK(shipping >= 0),
        total REAL NOT NULL CHECK(total >= 0),
        status TEXT NOT NULL CHECK(status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
        shippingAddress TEXT NOT NULL,
        paymentMethod TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Order items table
      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        orderId TEXT NOT NULL,
        productId TEXT NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL CHECK(price >= 0),
        quantity INTEGER NOT NULL CHECK(quantity > 0),
        image TEXT NOT NULL,
        FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
      );

      -- Create indexes for better query performance
      CREATE INDEX IF NOT EXISTS idx_cart_userId ON cart_items(userId);
      CREATE INDEX IF NOT EXISTS idx_cart_productId ON cart_items(productId);
      CREATE INDEX IF NOT EXISTS idx_favorites_userId ON favorites(userId);
      CREATE INDEX IF NOT EXISTS idx_favorites_productId ON favorites(productId);
      CREATE INDEX IF NOT EXISTS idx_orders_userId ON orders(userId);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_order_items_orderId ON order_items(orderId);
    `;

    try {
      await this.db.execute(createTablesSQL);
      console.log("Tables created successfully");
    } catch (error) {
      console.error("Error creating tables:", error);
      throw new Error(
        `Failed to create tables: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Execute a SELECT query (works on both web and native)
   * @param sql SQL query string
   * @param params Query parameters
   * @returns Query results as array of objects
   */
  async query(sql: string, params: any[] = []): Promise<any[]> {
    await this.ensureInitialized();

    if (this.platform === "web") {
      return this.queryLocalStorage(sql, params);
    }

    if (!this.db) {
      throw new Error("Database connection not established");
    }

    try {
      const result = await this.db.query(sql, params);
      return result.values || [];
    } catch (error) {
      console.error("Query error:", error);
      throw new Error(
        `Query failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Execute query on localStorage (web platform)
   */
  private queryLocalStorage(sql: string, params: any[] = []): any[] {
    const sqlLower = sql.toLowerCase().trim();

    // Parse table name from SQL
    let tableName = "";
    if (sqlLower.includes("from users")) tableName = "users";
    else if (sqlLower.includes("from cart_items")) tableName = "cart_items";
    else if (sqlLower.includes("from favorites")) tableName = "favorites";
    else if (sqlLower.includes("from orders")) tableName = "orders";
    else if (sqlLower.includes("from order_items")) tableName = "order_items";

    const storageKey = this.getStorageKey(tableName);
    const data = JSON.parse(localStorage.getItem(storageKey) || "[]");

    // Simple WHERE clause parsing
    let filteredData = data;

    if (sqlLower.includes("where")) {
      // Handle case-insensitive email queries for users table
      if (tableName === "users" && sqlLower.includes("lower")) {
        // Pattern: WHERE LOWER(TRIM(email)) = ? AND password = ?
        if (sqlLower.includes("password")) {
          const email = params[0];
          const password = params[1];
          filteredData = data.filter(
            (row: any) =>
              row.email.toLowerCase().trim() === email.toLowerCase().trim() &&
              row.password === password
          );
        }
        // Pattern: WHERE LOWER(email) = ?
        else {
          const email = params[0];
          filteredData = data.filter(
            (row: any) =>
              row.email.toLowerCase().trim() === email.toLowerCase().trim()
          );
        }
      }
      // Standard WHERE clause with parameters
      else if (params.length > 0) {
        // Handle multiple conditions with AND
        if (sqlLower.includes(" and ")) {
          // Parse multiple WHERE conditions (e.g., email = ? AND password = ?)
          const conditions =
            sqlLower.match(/where\s+(.+?)(?:\s+order|\s+limit|$)/)?.[1] || "";
          const conditionParts = conditions.split(" and ");

          filteredData = data.filter((row: any) => {
            return conditionParts.every((condition, idx) => {
              const columnMatch = condition.match(/(\w+)\s*=\s*\?/);
              if (columnMatch && params[idx] !== undefined) {
                const column = columnMatch[1];
                return row[column] === params[idx];
              }
              return true;
            });
          });
        }
        // Single WHERE condition
        else {
          const whereMatch = sqlLower.match(/where\s+(\w+)\s*=\s*\?/);
          if (whereMatch) {
            const column = whereMatch[1];
            const value = params[0];
            filteredData = data.filter((row: any) => row[column] === value);
          }
        }
      }
    }

    return filteredData;
  }

  /**
   * Execute an INSERT, UPDATE, or DELETE statement (works on both web and native)
   * @param sql SQL statement
   * @param params Statement parameters
   * @returns Result with changes information
   */
  async run(sql: string, params: any[] = []): Promise<any> {
    await this.ensureInitialized();

    if (this.platform === "web") {
      return this.runLocalStorage(sql, params);
    }

    if (!this.db) {
      throw new Error("Database connection not established");
    }

    try {
      const result = await this.db.run(sql, params);
      return result;
    } catch (error) {
      console.error("Run error:", error);
      throw new Error(
        `Run failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Execute run on localStorage (web platform)
   */
  private runLocalStorage(sql: string, params: any[] = []): any {
    const sqlLower = sql.toLowerCase().trim();

    // Parse table name
    let tableName = "";
    if (
      sqlLower.includes("into users") ||
      sqlLower.includes("from users") ||
      sqlLower.includes("update users")
    ) {
      tableName = "users";
    } else if (sqlLower.includes("cart_items")) {
      tableName = "cart_items";
    } else if (sqlLower.includes("favorites")) {
      tableName = "favorites";
    } else if (
      sqlLower.includes("into orders") ||
      sqlLower.includes("from orders") ||
      sqlLower.includes("update orders")
    ) {
      tableName = "orders";
    } else if (sqlLower.includes("order_items")) {
      tableName = "order_items";
    }

    const storageKey = this.getStorageKey(tableName);
    const data = JSON.parse(localStorage.getItem(storageKey) || "[]");

    // Handle INSERT
    if (sqlLower.startsWith("insert")) {
      const columnMatch = sql.match(/\((.*?)\)/);
      if (columnMatch) {
        const columns = columnMatch[1].split(",").map((c) => c.trim());
        const newRow: any = {};
        columns.forEach((col, idx) => {
          newRow[col] = params[idx];
        });
        data.push(newRow);
        localStorage.setItem(storageKey, JSON.stringify(data));
        return { changes: { changes: 1, lastId: newRow.id } };
      }
    }

    // Handle UPDATE
    if (sqlLower.startsWith("update")) {
      const setMatch = sql.match(/set\s+(.*?)\s+where/i);
      const whereMatch = sql.match(/where\s+(\w+)\s*=\s*\?/i);

      if (setMatch && whereMatch) {
        const setPairs = setMatch[1].split(",");
        const whereColumn = whereMatch[1];
        const whereValue = params[params.length - 1];

        let changes = 0;
        data.forEach((row: any) => {
          if (row[whereColumn] === whereValue) {
            setPairs.forEach((pair, idx) => {
              const column = pair.split("=")[0].trim();
              row[column] = params[idx];
            });
            changes++;
          }
        });

        localStorage.setItem(storageKey, JSON.stringify(data));
        return { changes: { changes } };
      }
    }

    // Handle DELETE
    if (sqlLower.startsWith("delete")) {
      const whereMatch = sql.match(/where\s+(\w+)\s*=\s*\?/i);
      if (whereMatch) {
        const column = whereMatch[1];
        const value = params[0];
        const filteredData = data.filter((row: any) => row[column] !== value);
        const changes = data.length - filteredData.length;
        localStorage.setItem(storageKey, JSON.stringify(filteredData));
        return { changes: { changes } };
      }
    }

    return { changes: { changes: 0 } };
  }

  /**
   * Execute raw SQL (can contain multiple statements)
   * @param sql SQL statements
   * @returns Execution result
   */
  async execute(sql: string): Promise<any> {
    await this.ensureInitialized();

    if (this.platform === "web") {
      // For web, we don't support raw execute
      console.warn("Execute not fully supported on web platform");
      return { changes: { changes: 0 } };
    }

    if (!this.db) {
      throw new Error("Database connection not established");
    }

    try {
      const result = await this.db.execute(sql);
      return result;
    } catch (error) {
      console.error("Execute error:", error);
      throw new Error(
        `Execute failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Execute multiple operations in a transaction
   * @param callback Function containing database operations
   */
  async transaction(callback: () => Promise<void>): Promise<void> {
    await this.ensureInitialized();

    if (this.platform === "web") {
      // For web, just execute the callback without transaction support
      await callback();
      return;
    }

    if (!this.db) {
      throw new Error("Database connection not established");
    }

    try {
      await this.db.execute("BEGIN TRANSACTION;");
      await callback();
      await this.db.execute("COMMIT;");
    } catch (error) {
      await this.db.execute("ROLLBACK;");
      console.error("Transaction error:", error);
      throw new Error(
        `Transaction failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Get storage key for table name
   */
  private getStorageKey(tableName: string): string {
    const keyMap: { [key: string]: string } = {
      users: STORAGE_KEYS.USERS,
      cart_items: STORAGE_KEYS.CART_ITEMS,
      favorites: STORAGE_KEYS.FAVORITES,
      orders: STORAGE_KEYS.ORDERS,
      order_items: STORAGE_KEYS.ORDER_ITEMS,
    };
    return keyMap[tableName] || STORAGE_KEYS.USERS;
  }

  /**
   * Clear all data (useful for testing or logout)
   */
  async clearAllData(): Promise<void> {
    if (this.platform === "web") {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.setItem(key, JSON.stringify([]));
      });
    } else if (this.db) {
      await this.db.execute(`
        DELETE FROM order_items;
        DELETE FROM orders;
        DELETE FROM favorites;
        DELETE FROM cart_items;
        DELETE FROM users;
      `);
    }
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      try {
        await this.db.close();
        console.log("Database connection closed");
      } catch (error) {
        console.error("Error closing database:", error);
      } finally {
        this.db = null;
        this.isInitialized = false;
      }
    }
  }

  /**
   * Get the database connection instance (native only)
   * @returns SQLiteDBConnection instance
   */
  getDB(): SQLiteDBConnection {
    if (!this.isInitialized) {
      throw new Error("Database not initialized. Call initialize() first.");
    }

    if (this.platform === "web") {
      throw new Error(
        "Direct database access not available on web platform - use query() and run() methods"
      );
    }

    if (!this.db) {
      throw new Error("Database connection not established");
    }

    return this.db;
  }

  /**
   * Check if database is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get current platform
   */
  getPlatform(): string {
    return this.platform;
  }

  /**
   * Ensure database is initialized before operations
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }
}

// Export a singleton instance
export const database = new DatabaseService();

// Export the class for testing purposes
export { DatabaseService };
