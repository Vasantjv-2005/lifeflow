
import { Response } from "express";

/**
 * Standard structure for successful API responses.
 */
export interface ApiSuccessResponse<T> {
    success: true;
    message: string;
    data: T;
}

/**
 * Standard structure for failed API responses.
 */
export interface ApiErrorResponse {
    success: false;
    message: string;
    errors?: string[];
}

/**
 * Sends a consistent successful JSON response.
 *
 * @param res - Express response object.
 * @param message - Description of the operation result.
 * @param data - Response payload.
 * @param statusCode - HTTP status code (defaults to 200).
 * @returns The Express response.
 */
export const sendSuccess = <T>(
    res: Response,
    message: string,
    data: T,
    statusCode = 200
): Response<ApiSuccessResponse<T>> => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

/**
 * Sends a consistent error JSON response.
 *
 * @param res - Express response object.
 * @param message - Description of the error.
 * @param statusCode - HTTP status code (defaults to 400).
 * @param errors - Optional list of validation or other error details.
 * @returns The Express response.
 */
export const sendError = (
    res: Response,
    message: string,
    statusCode = 400,
    errors?: string[]
): Response<ApiErrorResponse> => {
    const response: ApiErrorResponse = {
        success: false,
        message,
    };

    if (errors && errors.length > 0) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};
