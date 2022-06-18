import express from 'express';
import statuses from 'statuses';

// TODO: I dont think we need to use this...
export function apiResponse(res: express.Response, status: number, message?: string): void {
    let body = `Status: ${status} ${statuses(status)}`;

    if (message) {
        body = `${body}\n${message}`;
    }

    res
        .status(status)
        .send(body);
}