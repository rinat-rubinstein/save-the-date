import * as functions from 'firebase-functions';
import { Database } from './classes/Database';
import { Twilio } from './classes/Twilio';
import { c } from './imports';


const getAccessToken = (req: any, res: any) => {

    console.log('Getting Access Token', req.query);

    const AccessToken = require('twilio').jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    // Substitute your Twilio AccountSid and ApiKey details
    const ACCOUNT_SID = functions.config().twilio.account;
    const API_KEY_SID = functions.config().twilio.sid;
    const API_KEY_SECRET = functions.config().twilio.secret;

    // Create an Access Token
    const accessToken = new AccessToken(
        ACCOUNT_SID,
        API_KEY_SID,
        API_KEY_SECRET
    );

    // Set the Identity of this token
    accessToken.identity = req.query.identity ?? Math.random().toString();

    // Grant access to Video
    const grant = new VideoGrant();
    grant.room = req.query.room ?? Math.random().toString();
    accessToken.addGrant(grant);

    // Serialize the token as a JWT
    const jwt = accessToken.toJwt();
    console.log(jwt);

    res.send(jwt);
}

const createRoom = (req: any, res: any) => {
    c(req, res, async () => {

        console.log('createRoom', req.body);

        const { hisName, herName, hisPhone, herPhone, roomName } = req.body;

        if (roomName === undefined || hisName === undefined) {
            res.status(400).send('Room Name Invalid');
            return;
        }

        const meeting: any = {
            hisName, herName, hisPhone, herPhone, roomName: `${roomName}`, createdAt: new Date(),
        }
        try {
            const meetingId = await Database.createMeeting(meeting);
            meeting.meetingId = meetingId;
        } catch (error) {
            res.status(400).send(error);
            return;
        }

        const jwt = Twilio.generateAccessToken(hisName, roomName);

        res.send({ jwt, meeting });
    })
}

const enterRoom = (req: any, res: any) => {
    c(req, res, async () => {
        const roomName = req.query.room;

        if (roomName === undefined) {
            res.status(400).send('Room Name Invalid');
            return;
        }

        let meeting: any;
        try {
            meeting = await Database.retrieveMeetingByRoomName(`${roomName}`);
        } catch (error) {
            res.status(400).send(error);
            return;
        }

        if (meeting === null) {
            res.status(404).send('Room Not Found');
            return;
        }

        const jwt = Twilio.generateAccessToken(meeting.herName, roomName);

        res.send({ jwt, meeting });
    })
}


export { getAccessToken, createRoom, enterRoom }   