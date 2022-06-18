import express from 'express';

export const app: express.Express = express();

app.use(express.text());

require('./routes/data/repository')(app)

module.exports = app;