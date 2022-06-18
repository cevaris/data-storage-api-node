import express from 'express';
import { BodyTooLargeError, FailedToParseBodyError } from '../common/errors';
import { logger } from '../common/logger';

/**
 * Parse the request body as a string, up until some defined max body length.
 * If body length max value is met, throw a bad request error.
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
            if (currSize > 10 * 1000 * 1000) {
                // stop uploading when limit is reached, return failure to client
                return next(new BodyTooLargeError(`Body exceeded the ${10 * 1000 * 1000} length limit.`));
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