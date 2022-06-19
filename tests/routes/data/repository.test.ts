import { afterAll, beforeAll, expect, test } from '@jest/globals';
import http from 'http';
import request from 'supertest';
import { app } from '../../../src/app';
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
            .send(body);

        expect(resp.status).toBe(201);

        const expectedObject = { oid: '7509e5bda0c762d2bac7f90d758b5b2263fa01ccbc542ab5e3df163be08e6ca9', size: 12 };
        const expectedJson = JSON.stringify(expectedObject);
        expect(resp.text).toBe(expectedJson);
    });
})