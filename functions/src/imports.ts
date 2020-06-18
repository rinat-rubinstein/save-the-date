import * as express from 'express';
import * as cors from 'cors';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const app: express.Application = express();

admin.initializeApp();


export { app, cors, functions, admin };