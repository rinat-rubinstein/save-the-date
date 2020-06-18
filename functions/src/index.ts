
import * as handlers from './handlers';
import { app, cors, functions } from './imports';

app.use(cors({ origin: '*' }));

app.use('/', handlers.getAccessToken)
app.get('/enter-room', handlers.enterRoom)
app.post('/create-room', handlers.createRoom)


exports.app = functions.https.onRequest(app);