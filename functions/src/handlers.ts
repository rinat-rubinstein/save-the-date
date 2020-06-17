

const getAccessToken = (req: any, res: any) => {

    console.log('Getting Access Token')

    var AccessToken = require('twilio').jwt.AccessToken;
    var VideoGrant = AccessToken.VideoGrant;

    // Substitute your Twilio AccountSid and ApiKey details
    var ACCOUNT_SID = 'ACbee50e6fc385c44262b929dc428457ff'
    var API_KEY_SID = 'SKd741d28241957be63d0265dc8da78c9e';
    var API_KEY_SECRET = 'xrylImZlrDLrR64gybrzB4773bzQWeEM';

    // Create an Access Token
    var accessToken = new AccessToken(
        ACCOUNT_SID,
        API_KEY_SID,
        API_KEY_SECRET
    );

    // Set the Identity of this token
    accessToken.identity = req.body.identity ?? Math.random().toString();

    // Grant access to Video
    const grant = new VideoGrant();
    grant.room = 'TestRoom';
    accessToken.addGrant(grant);

    // Serialize the token as a JWT
    var jwt = accessToken.toJwt();
    console.log(jwt);

    res.send(jwt);
}


export { getAccessToken }   