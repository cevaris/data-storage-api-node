import express from 'express';
import { MAX_BLOB_LENGTH } from '../common/config';
import { BodyTooLargeError, FailedToParseBodyError } from '../common/errors';
import { logger } from '../common/logger';

/**
 * Express middleware to parse the request body as a string, up until some defined max body length.
 * If body length max value is met, throw a bad request error.
 * 
 * This should be an improvement 
 * 
 * @param req 
 * @param res 
 * @param next 
 */
export function bodyToText(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
) {
    const body: any[] = [];
    let currSize = 0;
    req
        .on('data', (chunk: any) => {
            currSize += chunk.length;
            if (currSize > MAX_BLOB_LENGTH) {
                // stop uploading when limit is reached, return failure to client
                return next(new BodyTooLargeError(`Body exceeded the ${MAX_BLOB_LENGTH} length limit.`));
            }

            body.push(chunk);
        })
        .on('error', (err: Error) => {
            const message = 'failure when reading the request body';
            logger.error(message, err);
            return next(new FailedToParseBodyError(message));
        })
        .on('end', () => {
            req.body = body.toString();
            next();
        });
};
