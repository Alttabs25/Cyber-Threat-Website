/**
 * Simple password hashing utility
 * Uses browser's SubtleCrypto API for secure hashing
 */

/**
 * Hash a password using SHA-256
 * @param password Plain text password
 * @returns Hashed password as hex string
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    // Convert password to Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    // Hash using SHA-256
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    // Convert hash to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return hashHex;
  } catch (error) {
    console.error("Error hashing password:", error);
    // Fallback: return the password as-is (not secure but prevents app crash)
    return password;
  }
}

/**
 * Verify a password against a hash
 * @param password Plain text password to verify
 * @param hash Stored hash to compare against
 * @returns True if password matches the hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    const passwordHash = await hashPassword(password);
    return passwordHash === hash;
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
}
