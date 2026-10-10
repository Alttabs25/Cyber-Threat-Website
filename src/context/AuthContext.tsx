import React, { createContext, useContext, useState, useEffect } from "react";
import storageService from "../services/storage";
import { hashPassword, verifyPassword } from "../utils/crypto";

interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loginWithGoogle: () => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => void;
  resetProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from storage service on mount
  useEffect(() => {
    const currentUser = storageService.getCurrentUser();
    if (currentUser) {
      setUser({
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        profileImage: currentUser.profileImage,
        phone: currentUser.phone,
        address: currentUser.address,
      });
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Validate inputs
      if (!email || !password) {
        console.error("Login failed: Email and password are required");
        return false;
      }

      // Normalize email
      const normalizedEmail = email.trim().toLowerCase();

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get user by email
      const existingUser = await storageService.getUserByEmail(normalizedEmail);

      if (!existingUser) {
        console.log("Login failed: User not found");
        return false;
      }

      // Verify password (supports both hashed and plain text for backward compatibility)
      let isPasswordValid = false;

      // Check if password is hashed (64 chars = SHA-256 hex)
      if (existingUser.password.length === 64) {
        isPasswordValid = await verifyPassword(password, existingUser.password);
      } else {
        // Plain text comparison (for existing users)
        isPasswordValid = password === existingUser.password;

        // Update to hashed password
        if (isPasswordValid) {
          const hashedPassword = await hashPassword(password);
          await storageService.updateUser(existingUser.id, {
            password: hashedPassword,
          });
        }
      }

      if (!isPasswordValid) {
        console.log("Login failed: Invalid password");
        return false;
      }

      // Login successful
      const userData: User = {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        profileImage: existingUser.profileImage,
        phone: existingUser.phone,
        address: existingUser.address,
      };

      setUser(userData);
      setIsAuthenticated(true);
      storageService.setCurrentUser(existingUser);

      console.log("Login successful");
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      // Validate inputs
      if (!name || !email || !password) {
        console.error("Signup failed: All fields are required");
        return false;
      }

      if (name.trim().length < 2) {
        console.error("Signup failed: Name must be at least 2 characters");
        return false;
      }

      if (password.length < 6) {
        console.error("Signup failed: Password must be at least 6 characters");
        return false;
      }

      // Normalize email
      const normalizedEmail = email.trim().toLowerCase();
      const trimmedName = name.trim();

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check for existing user with case-insensitive email
      console.log(
        "[SIGNUP] Checking for existing user with email:",
        normalizedEmail
      );
      const existingUser = await storageService.getUserByEmail(normalizedEmail);
      console.log("[SIGNUP] getUserByEmail result:", existingUser);

      if (existingUser) {
        console.log("[SIGNUP] User already exists, signup failed");
        return false;
      }

      // Hash password before storing
      const hashedPassword = await hashPassword(password);
      console.log("[SIGNUP] Password hashed successfully");

      // Create new user with normalized data and hashed password
      const newUser = await storageService.createUser({
        name: trimmedName,
        email: normalizedEmail,
        password: hashedPassword,
      });

      // Auto-login after signup
      const userData: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        profileImage: newUser.profileImage,
        phone: newUser.phone,
        address: newUser.address,
      };
      setUser(userData);
      setIsAuthenticated(true);
      storageService.setCurrentUser(newUser);

      console.log("[SIGNUP] User created and logged in successfully");
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      // Simulate Google OAuth
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate a unique Google email for testing
      const googleEmail = `google.user.${Date.now()}@gmail.com`;

      // Check if Google user already exists
      let existingUser = await storageService.getUserByEmail(googleEmail);

      if (!existingUser) {
        // Create new Google user with default values
        existingUser = await storageService.createUser({
          name: "Google User",
          email: googleEmail,
          password: `google-oauth-${Date.now()}`, // Secure token, not user-facing
        });
      }

      const googleUser: User = {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        profileImage: existingUser.profileImage,
        phone: existingUser.phone,
        address: existingUser.address,
      };

      setUser(googleUser);
      setIsAuthenticated(true);
      storageService.setCurrentUser(existingUser);

      console.log("[GOOGLE LOGIN] User logged in successfully");
      return true;
    } catch (error) {
      console.error("Google login error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    storageService.logout();
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (user) {
      const success = await storageService.updateUser(user.id, updates);

      if (success) {
        // Get the updated user from storage service
        const updatedStorageUser = await storageService.getUserById(user.id);
        if (updatedStorageUser) {
          const updatedUser: User = {
            id: updatedStorageUser.id,
            name: updatedStorageUser.name,
            email: updatedStorageUser.email,
            profileImage: updatedStorageUser.profileImage,
            phone: updatedStorageUser.phone,
            address: updatedStorageUser.address,
          };
          setUser(updatedUser);
        }
      }
    }
  };

  const resetProfile = async () => {
    logout();
    // Clear all app data from storage service
    await storageService.clearAllData();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        signup,
        logout,
        loginWithGoogle,
        updateProfile,
        resetProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
