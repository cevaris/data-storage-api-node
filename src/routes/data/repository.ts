import express from 'express';
import { toSha256Hex } from '../../common/hashing';
import { ObjectId, PersistedRepositoryObject } from '../../storage/persisted';
import { repositoryClient } from '../../storage/repository';

module.exports = (app: express.Express) => {
    app.put('/data/:repository',
        async (req: PutRepositoryRequest, res: express.Response, next: express.NextFunction) => {
            // TODO: validate params
            
            const repository = req.params.repository;
            const blob = req.body;
            const now: Date = new Date();
            const oid: ObjectId = toSha256Hex(req.body);

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
                next(error);
            }

            const response: PutRepositoryResponse = {
                oid: 'oidoidoid',
                size: req.body.length,
            };
            return res.json(response);
        });
};

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