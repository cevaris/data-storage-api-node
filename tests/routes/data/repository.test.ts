import { afterAll, beforeAll, expect, test } from '@jest/globals';
import http from 'http';
import request from 'supertest';
import zlib from 'zlib';
import { app } from '../../../src/app';
import { MAX_BLOB_LENGTH, MAX_REPOSITORY_LENGTH } from '../../../src/common/config';
import { logger } from '../../../src/common/logger';
import { repositoryClient } from '../../../src/storage/repository';

let server: http.Server;

beforeAll((done) => {
    // disable error logging
    jest.spyOn(logger, 'error').mockImplementation(() => { });

    server = app.listen(done);
})

beforeEach((done) => {
    // clears db to before each test case, to prevent impacting each others tests state
    repositoryClient.clear()
        .then(() => done());
})

afterAll((done) => {
    // after all test are executed, shutdown server
    server.close(done);
});

describe("data-storage-api-node extended", () => {
    test('returns 201 when PUT object', async () => {
        const body = 'hello world!';

        const resp = await request(server)
            .put('/data/apples')
            .set('Content-Type', 'text/html')
            .set('Accept', 'application/json')
            .send(body);

        expect(resp.status).toBe(201);
        expect(resp.body).toStrictEqual({
            oid: '7509e5bda0c762d2bac7f90d758b5b2263fa01ccbc542ab5e3df163be08e6ca9',
            size: 12
        });
    });

    test('returns 400 when PUT duplicate repository object', async () => {
        const body = 'hello world!';
        const repository = 'apples';

        const putResp1 = await request(server)
            .put(`/data/${repository}`)
            .set('Content-Type', 'text/plain')
            .set('Accept', 'application/json')
            .send(body);

        expect(putResp1.status).toBe(201);

        const putResp2 = await request(server)
            .put(`/data/${repository}`)
            .set('Content-Type', 'text/plain')
            .set('Accept', 'application/json')
            .send(body);

        expect(putResp2.status).toBe(400);
        expect(putResp2.body).toBeTruthy();
        expect(putResp2.body).toStrictEqual({
            error: {
                status: 400,
                message: 'Duplicate. Repository Object already exists.'
            }
        });
    });

    test('returns 201 when PUT same object in different repositories', async () => {
        const body = 'hello world!';

        const putResp1 = await request(server)
            .put(`/data/apples`)
            .set('Content-Type', 'text/plain')
            .set('Accept', 'application/json')
            .send(body);

        expect(putResp1.status).toBe(201);

        const putResp2 = await request(server)
            .put(`/data/oranges`)
            .set('Content-Type', 'text/plain')
            .set('Accept', 'application/json')
            .send(body);

        expect(putResp2.status).toBe(201);
    });

    xtest('returns 201 when PUT deflated object', async () => {
        // TODO: Test HTTP compressoin works as expected correctly
        //       with the express.txt({options}) middleware

        const body = 'hello world!';
        const gzippedBody = zlib.gzipSync(body).toString();

        const putResp = await request(server)
            .put(`/data/apples`)
            .set('Content-Type', 'text/plain')
            .set('Accept', 'application/json')
            // .set('Content-Encoding', 'gzip')
            .set('Accept-Encoding', 'gzip, deflate')
            .send(gzippedBody);

        expect(putResp.status).toBe(201);

        const getResp = await request(server)
            .put(`/data/apples/${putResp.body.oid}`)
            .set('Content-Type', 'text/plain')
            .set('Content-Encoding', 'gzip')

        expect(getResp.status).toBe(400);
        expect(getResp.text).toBe('who knows');
    });

    test('returns 400 when PUT invalid repository name - invalid chars', async () => {
        const body = 'hello world!';
        const repository = '!@#🚀$%';

        const putResp = await request(server)
            .put(`/data/${repository}`)
            .set('Content-Type', 'text/plain')
            .set('Accept', 'application/json')
            .send(body);

        expect(putResp.status).toBe(400);
        expect(putResp.body).toBeTruthy();
        expect(putResp.body).toStrictEqual({
            error: {
                status: 400,
                message: 'Repository contains invalid characters.'
            }
        });
    });

    test('returns 400 when PUT repository object body is too long', async () => {
        const body = 'a'.repeat(MAX_BLOB_LENGTH + 1);

        const putResp = await request(server)
            .put(`/data/apples`)
            .set('Content-Type', 'text/plain')
            .set('Accept', 'application/json')
            .send(body);

        expect(putResp.status).toBe(413);
        expect(putResp.body).toBeTruthy();
        expect(putResp.body).toStrictEqual({
            error: {
                status: 413,
                message: 'request entity too large'
            }
        });
    });

    test('returns 400 when PUT invalid repository name - too long', async () => {
        const repository = 'a'.repeat(MAX_REPOSITORY_LENGTH + 1);

        const putResp = await request(server)
            .put(`/data/${repository}`)
            .set('Content-Type', 'text/plain')
            .set('Accept', 'application/json')
            .send(repository);

        expect(putResp.status).toBe(400);
        expect(putResp.body).toBeTruthy();
        expect(putResp.body).toStrictEqual({
            error: {
                status: 400,
                message: 'Repository name length must be less than 100.',
            }
        });
    });

    test('returns 400 when PUT us using an unsupported Content-Type', async () => {
        const repository = 'a'.repeat(MAX_REPOSITORY_LENGTH + 1);

        const putResp = await request(server)
            .put(`/data/${repository}`)
            .set('Content-Type', 'def/not/supported')
            .send(repository);

        expect(putResp.status).toBe(400);
        expect(putResp.body).toBeTruthy();
        expect(putResp.body).toStrictEqual({
            error: {
                status: 400,
                message: "Content-Type 'def/not/supported' is not supported.",
            }
        });
    });

    test('returns 400 when PUT invalid repository name - prefixed with spaces', async () => {
        const repositoryWithEncodedSpaceChar = '%20apples'

        const putResp = await request(server)
            .put(`/data/${repositoryWithEncodedSpaceChar}`)
            .set('Content-Type', 'text/plain')
            .set('Accept', 'application/json')
            .send(repositoryWithEncodedSpaceChar);

        expect(putResp.status).toBe(400);
        expect(putResp.body).toBeTruthy();
        expect(putResp.body).toStrictEqual({
            error: {
                status: 400,
                message: 'Repository contains invalid characters.',
            }
        });
    });

    test('returns 404 when PUT with repository and objectId', async () => {
        // note oid are generated on the backend and cannot be manually set by client.

        const body = 'hello world!';

        // note custom OIDs are not allowed
        const resp = await request(server)
            .put('/data/apples/customOID')
            .set('Content-Type', 'text/plain')
            .set('Accept', 'application/json')
            .send(body);

        expect(resp.status).toBe(404);
        expect(resp.body).toBeTruthy();
        expect(resp.body).toStrictEqual({
            error: {
                status: 404,
                message: 'Not Found.'
            }
        });
    });

    test('returns 404 when DELETE a non-existent object', async () => {
        const resp = await request(server)
            .delete('/datat/apples/doesNotExist');
        expect(resp.status).toBe(404);
        expect(resp.body).toStrictEqual({
            error: {
                status: 404,
                message: 'Not Found.'
            }
        });
    });

})