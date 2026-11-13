"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
/**
 * Sends a consistent successful JSON response.
 *
 * @param res - Express response object.
 * @param message - Description of the operation result.
 * @param data - Response payload.
 * @param statusCode - HTTP status code (defaults to 200).
 * @returns The Express response.
 */
const sendSuccess = (res, message, data, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
exports.sendSuccess = sendSuccess;
/**
 * Sends a consistent error JSON response.
 *
 * @param res - Express response object.
 * @param message - Description of the error.
 * @param statusCode - HTTP status code (defaults to 400).
 * @param errors - Optional list of validation or other error details.
 * @returns The Express response.
 */
const sendError = (res, message, statusCode = 400, errors) => {
    const response = {
        success: false,
        message,
    };
    if (errors && errors.length > 0) {
        response.errors = errors;
    }
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
