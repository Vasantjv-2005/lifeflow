"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
/**
 * Reads and validates the JWT secret from configuration.
 */
const getJwtSecret = () => {
    return env_1.env.JWT_SECRET;
};
/**
 * Generates a signed JWT for an authenticated user.
 *
 * @param userId - MongoDB ID of the authenticated user.
 * @returns A signed JWT string.
 */
const generateToken = (userId) => {
    if (!userId || userId.trim().length === 0) {
        throw new Error("A valid user ID is required to generate a token.");
    }
    const secret = getJwtSecret();
    const options = {
        expiresIn: (env_1.env.JWT_EXPIRES_IN || "7d"),
        issuer: "lifeflow-api",
        subject: userId,
    };
    return jsonwebtoken_1.default.sign({ userId }, secret, options);
};
exports.generateToken = generateToken;
/**
 * Verifies a JWT and validates its expected payload.
 *
 * @param token - JWT string received from the client.
 * @returns The validated authentication payload.
 * @throws If the token is invalid, expired, or has an unexpected payload.
 */
const verifyToken = (token) => {
    if (!token || token.trim().length === 0) {
        throw new Error("A token is required for verification.");
    }
    const secret = getJwtSecret();
    const decoded = jsonwebtoken_1.default.verify(token, secret, {
        issuer: "lifeflow-api",
    });
    if (typeof decoded !== "object" ||
        decoded === null ||
        typeof decoded.userId !== "string" ||
        decoded.userId.trim().length === 0) {
        throw new Error("The token payload is invalid.");
    }
    if (decoded.sub !== decoded.userId) {
        throw new Error("The token subject does not match the user ID.");
    }
    return decoded;
};
exports.verifyToken = verifyToken;
/**
 * Decodes a JWT without verifying its signature.
 *
 * This function is for inspection only.
 * Never use its output alone to authenticate a user.
 *
 * @param token - JWT string to decode.
 * @returns The decoded payload, or null if decoding fails.
 */
const decodeToken = (token) => {
    if (!token || token.trim().length === 0) {
        return null;
    }
    const decoded = jsonwebtoken_1.default.decode(token);
    if (typeof decoded !== "object" ||
        decoded === null ||
        typeof decoded.userId !== "string" ||
        decoded.userId.trim().length === 0) {
        return null;
    }
    return decoded;
};
exports.decodeToken = decodeToken;
