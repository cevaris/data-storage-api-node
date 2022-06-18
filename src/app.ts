import express from 'express';

export const app: express.Express = express();

app.use(express.text());

// The tests exercise the server by requiring it as a module,
// rather than running it in a separate process and listening on a port
// module.exports = app

app.get('/data/:repository/:objectID', (req, res) => {
    res.status(200)
})
