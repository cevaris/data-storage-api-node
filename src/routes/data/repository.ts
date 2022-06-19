import express from 'express';
import { MAX_BLOB_LENGTH } from '../../common/config';
import { toSha256Hex } from '../../common/hashing';
import { logger } from '../../common/logger';
import { ApiRepositoryObject, ApiRepositoryObjectDownload, presentRepositoryObject, presentRepositoryObjectDownload } from '../../presenters/repository';
import { ObjectId, PersistedRepositoryObject } from '../../storage/persisted';
import { repositoryClient, validateRepositoryName } from '../../storage/repository';

const putBodyParser = express.text({
    limit: MAX_BLOB_LENGTH,
    inflate: true,
    // type: ['text/plain', 'text/html'],
});

module.exports = (app: express.Express) => {

    // TODO: consider handling gzip/compressed data gracefully

    app.put('/data/:repository',

        // NOTE: inject middleware, parses request body and assigns to req.body value as a string
        // bodyToText,
        putBodyParser,

        async (req: PutRepositoryRequest, res: express.Response, next: express.NextFunction) => {
            const blob = req.body;
            const repository = req.params.repository;

            try {
                validateRepositoryName(repository);
            } catch (error) {
                return next(error);
            }

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

            const apiRepositoryObject: ApiRepositoryObject = presentRepositoryObject(persistedRepositoryObject);
            return res.status(201).json(apiRepositoryObject);
        });

    app.get('/data/:repository/:oid',
        async (req: GetRepositoryRequest, res: express.Response, next: express.NextFunction) => {
            try {
                const persistedRepositoryObject: PersistedRepositoryObject =
                    await repositoryClient.get(req.params.repository, req.params.oid);

                const apiRepositoryObjectDownload: ApiRepositoryObjectDownload =
                    presentRepositoryObjectDownload(persistedRepositoryObject);
                return res.contentType('plain/text').
                    status(200).send(apiRepositoryObjectDownload);
            } catch (error) {
                return next(error);
            }
        });

    app.delete('/data/:repository/:oid',
        async (req: DeleteRepositoryRequest, res: express.Response, next: express.NextFunction) => {
            try {
                await repositoryClient.delete(req.params.repository, req.params.oid);

                // NOTE: end() here terminates the stream, preventing anything else being written
                //       in this case, we are not returning anything back to the client, i.e void.
                return res.status(200).end()
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