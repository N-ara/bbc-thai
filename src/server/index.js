import express from 'express';
import { render } from '@jaredpalmer/after';
import routes from '../app/routes';
import Document from '../app/components/Document';
import { getPublicDirectory } from './config';

/* eslint-disable import/no-dynamic-require */
const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);
const publicDirectory = getPublicDirectory();
const server = express();
server
  .disable('x-powered-by')
  .use('/data', express.static('data'))
  .use(express.static(publicDirectory))
  .get('/status', (req, res) => {
    res.sendStatus(200);
  })
  .get('/*', async (req, res) => {
    try {
      const html = await render({
        req,
        res,
        routes,
        document: Document,
        assets,
      });
      res.send(html);
    } catch (error) {
      res.json(error);
    }
  });

export default server;
