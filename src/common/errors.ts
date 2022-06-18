export class ApiError extends Error {
    status: number;
    constructor(status: number, message?: string) {
        super(message);
        this.status = status;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

export class DuplicateRepositoryObjectError extends ApiError {
    constructor() {
        super(400, 'Duplicate. Repository Object already exists.');
        Object.setPrototypeOf(this, DuplicateRepositoryObjectError.prototype);
    }
}


export class NotFoundError extends ApiError {
    constructor() {
        super(404);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}