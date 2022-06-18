import express from 'express';

module.exports = (app: express.Express) => {
    app.put('/data/:repository',
        async (req: PutRepositoryRequest, res: express.Response) => {
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