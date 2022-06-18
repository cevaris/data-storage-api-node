import express from 'express';
import { toSha256Hex } from '../../common/hashing';
import { bodyToText } from '../../middleware/bodyToString';
import { ObjectId, PersistedRepositoryObject } from '../../storage/persisted';
import { repositoryClient } from '../../storage/repository';

module.exports = (app: express.Express) => {
    app.put('/data/:repository',

        // inject middleware, parses request body and assigns to req.body value as a string
        bodyToText,

        async (req: PutRepositoryRequest, res: express.Response, next: express.NextFunction) => {
            // TODO: validate params
            const repository = req.params.repository;
            const blob = req.body;
            const now: Date = new Date();
            const oid: ObjectId = toSha256Hex(blob);

            const persistedRepositoryObject: PersistedRepositoryObject = {
                oid,
                repository,
                blob,
                size: blob.length,
                createdAt: now,
            };

            try {
                await repositoryClient.create(persistedRepositoryObject);
            } catch (error) {
                return next(error);
            }

            const response: PutRepositoryResponse = {
                oid,
                size: blob.length,
            };
            return res.status(201).json(response);
        });

    app.get('/data/:repository/:oid',
        async (req: GetRepositoryRequest, res: express.Response, next: express.NextFunction) => {
            try {
                const persistedRepositoryObject: PersistedRepositoryObject =
                    await repositoryClient.get(req.params.repository, req.params.oid);
                return res.contentType('plain/text').status(200).send(persistedRepositoryObject.blob);
            } catch (error) {
                return next(error);
            }
        });

    app.delete('/data/:repository/:oid',
        async (req: DeleteRepositoryRequest, res: express.Response, next: express.NextFunction) => {
            try {
                await repositoryClient.delete(req.params.repository, req.params.oid);

                return res.status(200).end();
            } catch (error) {
                return next(error);
            }
        });
};

interface DeleteRepositoryRequest extends express.Request {
    params: {
        oid: string
        repository: string
    }
}

interface GetRepositoryRequest extends express.Request {
    params: {
        oid: string
        repository: string
    }
}

interface PutRepositoryRequest extends Express.Request {
    params: {
        repository: string
    }
    body: string
}
interface PutRepositoryResponse {
    oid: string;
    size: number;
}