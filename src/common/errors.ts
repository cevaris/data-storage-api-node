export class ApiError extends Error {
    status: number;
    constructor(status: number, message?: string) {
        super(message);
        this.status = status;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

/**
 * 400s
 */
export class BodyTooLargeError extends ApiError {
    constructor(message: string) {
        super(400, message);
        Object.setPrototypeOf(this, BodyTooLargeError.prototype);
    }
}
export class DuplicateRepositoryObjectError extends ApiError {
    constructor() {
        super(400, 'Duplicate. Repository Object already exists.');
        Object.setPrototypeOf(this, DuplicateRepositoryObjectError.prototype);
    }
}


/**
 * 404s
 */
export class NotFoundError extends ApiError {
    constructor() {
        super(404);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}


/**
 * 500s
 */
export class FailedToParseBodyError extends ApiError {
    constructor(message: string) {
        super(500, message);
        Object.setPrototypeOf(this, FailedToParseBodyError.prototype);
    }
}