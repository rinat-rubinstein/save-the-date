import * as express from 'express';
import * as handlers from '../functions/src/handlers';
import * as body_parser from 'body-parser';
import * as cors from 'cors';

const app: express.Application = express();

app.use(body_parser.json());
app.use(cors({ origin: '*' }));

app.use('/', handlers.getAccessToken)

app.listen(3000, () => { console.log('App is listening on port 3000!'); }); 