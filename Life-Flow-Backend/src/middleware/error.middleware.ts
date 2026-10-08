import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

/**
 * Custom application error.
 *
 * Use this class when you want to throw an error with
 * a specific HTTP status code.
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        statusCode = 500,
        isOperational = true
    ) {
        super(message);

        this.name = "AppError";
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}

/**
 * Global error-handling middleware.
 *
 * Responsibilities:
 * 1. Handle custom application errors.
 * 2. Handle Mongoose validation errors.
 * 3. Handle invalid MongoDB ObjectIds.
 * 4. Handle duplicate MongoDB values.
 * 5. Prevent internal error details from being exposed.
 * 6. Return a consistent JSON response.
 */
export const errorMiddleware = (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error("Backend error:", error);

    // ----------------------------------------
    // Custom application error
    // ----------------------------------------
    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });

        return;
    }

    // ----------------------------------------
    // Mongoose validation error
    // ----------------------------------------
    if (error instanceof mongoose.Error.ValidationError) {
        const messages = Object.values(error.errors).map(
            (validationError) => validationError.message
        );

        res.status(400).json({
            success: false,
            message: "Validation failed.",
            errors: messages,
        });

        return;
    }

    // ----------------------------------------
    // Invalid MongoDB ObjectId
    // ----------------------------------------
    if (error instanceof mongoose.Error.CastError) {
        res.status(400).json({
            success: false,
            message: "Invalid resource ID.",
        });

        return;
    }

    // ----------------------------------------
    // Duplicate MongoDB key
    // ----------------------------------------
    if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
    ) {
        res.status(409).json({
            success: false,
            message: "A record with this value already exists.",
        });

        return;
    }

    // ----------------------------------------
    // Unknown / unexpected error
    // ----------------------------------------
    res.status(500).json({
        success: false,
        message: "Internal server error.",
    });
};