import { AppError } from "../common/errors";

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