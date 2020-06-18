
import * as handlers from './handlers';
import { app, c, functions } from './imports';


app.use(c);

app.get('/enter-room', handlers.enterRoom)
app.post('/create-room', handlers.createRoom)


exports.app = functions.https.onRequest(app);