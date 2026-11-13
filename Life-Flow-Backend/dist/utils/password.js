"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
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
const hashPassword = async (password) => {
    if (typeof password !== "string" || password.length === 0) {
        throw new Error("A valid password is required.");
    }
    return bcryptjs_1.default.hash(password, SALT_ROUNDS);
};
exports.hashPassword = hashPassword;
/**
 * Compares a plain-text password with its stored bcrypt hash.
 *
 * @param password - The plain-text password entered during login.
 * @param hashedPassword - The bcrypt hash stored in the database.
 * @returns True if the password matches; otherwise, false.
 */
const comparePassword = async (password, hashedPassword) => {
    if (typeof password !== "string" ||
        typeof hashedPassword !== "string" ||
        password.length === 0 ||
        hashedPassword.length === 0) {
        return false;
    }
    try {
        return await bcryptjs_1.default.compare(password, hashedPassword);
    }
    catch {
        return false;
    }
};
exports.comparePassword = comparePassword;
