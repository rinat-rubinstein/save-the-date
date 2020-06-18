import * as functions from 'firebase-functions';


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


export { getAccessToken }   