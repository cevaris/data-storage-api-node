import { HttpError } from "http-errors";
import { AppError } from "../common/errors";

/**
 * API shape for rendering errors back to callers
 */
export interface ApiError {
    error: {
        message: string;
        status: number;
    }
}

export function presentAppError(apiError: AppError): ApiError {
    const value: ApiError = {
        error: {
            status: apiError.status,
            message: apiError.message
        }
    }
    return value;
}

export function presentHttpError(httpError: HttpError): ApiError {
    const value: ApiError = {
        error: {
            status: httpError.status,
            message: httpError.message
        }
    }
    return value;
}