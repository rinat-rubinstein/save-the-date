
import * as express from 'express';
import * as handlers from './handlers';
import * as cors from 'cors';
import * as functions from 'firebase-functions';

const app: express.Application = express();

app.use(cors({ origin: '*' }));

app.use('/', handlers.getAccessToken)

exports.app = functions.https.onRequest(app);