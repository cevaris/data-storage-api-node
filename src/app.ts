import express from 'express';
import { AppError, NotFoundError } from './common/errors';
import { logger } from './common/logger';
import { ApiError, presentAppError } from './presenters/errors';

export const app: express.Express = express();

/**
 * Disable advertising this HTTP server as an Express server, to prevent malicious targeting.
 * https://stackoverflow.com/a/13055495/3538289
 */
app.disable('x-powered-by');

/**
 * Routes
 */
require('./routes/data/repository')(app)


// handle undefined routes as 404
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    next(new NotFoundError())
});

/**
 * Global error handling.
 * Custom handling for rendering ApiErrors to the destired HTTP response.
 */
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof AppError) {
        const apiError: ApiError = presentAppError(err);
        return res.status(err.status).json(apiError);
    }

    logger.error(`unhandled error: ${err}`);

    const apiError: ApiError = presentAppError(new AppError(500, 'Internal Error'));
    return res.status(500).json(apiError);
});