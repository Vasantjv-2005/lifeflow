
import bcrypt from "bcryptjs";

/**
 * Number of salt rounds used for password hashing.
 * A higher value increases hashing time and computational cost.
 */
const SALT_ROUNDS = 12;

/**
 * Hashes a plain-text password before it is stored in the database.
 *
 * @param password - The plain-text password provided by the user.
 * @returns A bcrypt password hash.
 * @throws If the password is empty or invalid.
 */
export const hashPassword = async (
    password: string
): Promise<string> => {
    if (typeof password !== "string" || password.length === 0) {
        throw new Error("A valid password is required.");
    }

    return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compares a plain-text password with its stored bcrypt hash.
 *
 * @param password - The plain-text password entered during login.
 * @param hashedPassword - The bcrypt hash stored in the database.
 * @returns True if the password matches; otherwise, false.
 */
export const comparePassword = async (
    password: string,
    hashedPassword: string
): Promise<boolean> => {
    if (
        typeof password !== "string" ||
        typeof hashedPassword !== "string" ||
        password.length === 0 ||
        hashedPassword.length === 0
    ) {
        return false;
    }

    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch {
        return false;
    }
};
