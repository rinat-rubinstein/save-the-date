import * as express from 'express';
import * as cors from 'cors';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const app: express.Application = express();

admin.initializeApp();
const c = cors({ origin: '*' });

export { app, c, functions, admin };