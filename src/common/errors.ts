/**
 * AppError can be any error thrown within the HTTP service.
 * AppErrors get rendered as ApiErrors in HTTP responses.
 * AppErrors require a HTTP status code.
 */
export class AppError extends Error {
    // HTTP status
    status: number;

    constructor(status: number, message?: string) {
        super(message);
        this.status = status;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

/**
 * 400s
 */
export class DuplicateRepositoryObjectError extends AppError {
    constructor() {
        super(400, 'Duplicate. Repository Object already exists.');
        Object.setPrototypeOf(this, DuplicateRepositoryObjectError.prototype);
    }
}
export class InvalidRepositoryName extends AppError {
    constructor(message: string) {
        super(400, message);
        Object.setPrototypeOf(this, InvalidRepositoryName.prototype);
    }
}
export class NotSupportedContentType extends AppError {
    constructor(message: string) {
        super(400, message);
        Object.setPrototypeOf(this, NotSupportedContentType.prototype);
    }
}


/**
 * 404s
 */
export class NotFoundError extends AppError {
    constructor() {
        super(404, "Not Found.");
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}