// The existing tests in this file should not be modified,
// but you can add more tests if needed.

const app = require('./src/app');
const logger = require('./src/common/logger').logger;
const repositoryClient = require('./src/storage/repository').repositoryClient;
const supertest = require('supertest')

let server; // http.Server

/**
 * spin up a server for every test class.
 */
beforeAll((done) => {
  // disable noisy error logging
  // use console.log directly if needed
  jest.spyOn(logger, 'error').mockImplementation(() => { });

  server = app.listen(done);
});

beforeEach((done) => {
  // clears db to before each test case, to prevent impacting each others tests state
  repositoryClient.clear()
    .then(() => done());
})

/**
 * spin own the server after tests complete.
 */
afterAll((done) => {
  // after all test are executed, shutdown server
  server.close(done);
});

describe('data-storage-api-node', () => {
  test('PUT', async () => {
    const putResult = await supertest(server)
      .put('/data/my-repo')
      .send('something')
      .set('Content-Type', 'text/plain')
      .set('Accept', 'application/json')
      .expect(201)

    expect(putResult.body).toBeTruthy()
    expect(typeof putResult.body).toBe('object')
    expect(putResult.body).toHaveProperty('oid')
    expect(typeof putResult.body.oid).toBe('string')
    expect(putResult.body.oid.length).toBeGreaterThan(0)
    expect(putResult.body).toHaveProperty('size')
    expect(typeof putResult.body.size).toBe('number')
    expect(putResult.body.size).toEqual(9)

    const putResult2 = await supertest(server)
      .put('/data/my-repo')
      .send('other')
      .set('Content-Type', 'text/plain')
      .set('Accept', 'application/json')
      .expect(201)

    expect(putResult2.body.size).toEqual(5)
    expect(putResult.body.oid).not.toBe(putResult2.body.oid)
  })

  test('GET', async () => {
    const putResult1 = await supertest(server)
      .put('/data/my-repo')
      .send('something')
      .set('Content-Type', 'text/plain')
      .set('Accept', 'application/json')
      .expect(201)

    await supertest(server)
      .get(`/data/my-repo/${putResult1.body.oid}`)
      .expect(200)
      .then(response => {
        expect(response.text).toEqual('something')
      })
  })

  test('GET not found', async () => {
    await supertest(server)
      .get(`/data/my-repo/missing`)
      .expect(404)
  })

  test('DELETE', async () => {
    const putResult = await supertest(server)
      .put('/data/my-repo')
      .send('something')
      .set('Content-Type', 'text/plain')
      .set('Accept', 'application/json')
      .expect(201)

    const hash = putResult.body.oid

    const dupResult = await supertest(server)
      .put('/data/other-repo')
      .send('something')
      .set('Content-Type', 'text/plain')
      .set('Accept', 'application/json')
      .expect(201)

    const dupHash = dupResult.body.oid

    await supertest(server)
      .delete(`/data/my-repo/${hash}`)
      .expect(200)

    await supertest(server)
      .get(`/data/my-repo/${hash}`)
      .expect(404)

    await supertest(server)
      .get(`/data/other-repo/${dupHash}`)
      .expect(200)
      .then(response => {
        expect(response.text).toEqual('something')
      })
  })

  test('DELETE not found', async () => {
    await supertest(server)
      .delete('/data/my-repo/missing')
      .expect(404)
  })
})
