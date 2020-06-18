import * as functions from 'firebase-functions';


const getAccessToken = (req: any, res: any) => {

    console.log('Getting Access Token', req.query);

    var AccessToken = require('twilio').jwt.AccessToken;
    var VideoGrant = AccessToken.VideoGrant;

    // Substitute your Twilio AccountSid and ApiKey details
    var ACCOUNT_SID = 'ACbee50e6fc385c44262b929dc428457ff'
    var API_KEY_SID = functions.config().twilio.sid;
    var API_KEY_SECRET = functions.config().twilio.secret;

    // Create an Access Token
    var accessToken = new AccessToken(
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
    var jwt = accessToken.toJwt();
    console.log(jwt);

    res.send(jwt);
}


export { getAccessToken }   