import { functions } from '../imports';
export class Twilio {


    static generateAccessToken(identity: any, roomName: any) {

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
        accessToken.identity = identity;

        // Grant access to Video
        const grant = new VideoGrant();
        grant.room = roomName;
        accessToken.addGrant(grant);

        // Serialize the token as a JWT
        const jwt = accessToken.toJwt();
        console.log(jwt);

        return jwt;
    }
}