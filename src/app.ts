import express from 'express';
import { ApiError, ApiErrorRenderable, NotFoundError } from './common/errors';
import { logger } from './common/logger';

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
    if (err instanceof ApiError) {
        return res.status(err.status).json(err.toRenderable());
    }

    logger.error(`unhandled error: ${err}`);
    const renderable: ApiErrorRenderable = {
        error: {
            status: 500,
            message: 'Internal Error',
        }
    }
    return res.status(500).json(renderable);
});