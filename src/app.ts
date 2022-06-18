import express from 'express';
import { ApiError } from './common/errors';
import { logger } from './common/logger';
import { apiResponse } from './common/response';

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

/**
 * Global error handling.
 * Custom handling for rendering ApiErrors to the destired HTTP response.
 */
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof ApiError) {
        return apiResponse(res, err.status, err.message);
    }

    logger.error(`unhandled error: ${err}`);
    return apiResponse(res, 500);
});

module.exports = app;
