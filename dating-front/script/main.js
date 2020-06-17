
const Video = Twilio.Video;

$(document).ready(() => {
  console.log("ready!");
});

const getAccessToken = () => {
  console.log("Getting Access Token");

  const http = new XMLHttpRequest();
  const url = "https://us-central1-savethedate-91944.cloudfunctions.net/app";

  http.open("GET", url);
  http.send();

  http.onreadystatechange = (e, ev) => {
    if (http.readyState === XMLHttpRequest.DONE) {
      console.log(http.response);
      startConference(http.response);
    }
  };
};

const startConference = token => {
  Video.connect(
    token,
    { name: "TestRoom" }
  ).then(room => {
    console.log('Connected to Room', room);

    Video.createLocalVideoTrack().then(track => {
      const localMediaContainer = document.getElementById('local-media');
      localMediaContainer.appendChild(track.attach());
    });

    room.participants.forEach(participantConnected);
    room.on("participantConnected", participantConnected);

    room.on("participantDisconnected", participantDisconnected);
    room.once("disconnected", error => room.participants.forEach(participantDisconnected));
  });

  function participantConnected(participant) {
    console.log(`Participant "${participant.identity}" connected`);

    participant.tracks.forEach(publication => {
      if (publication.isSubscribed) {
        const track = publication.track;
        document.getElementById('remote-media-div').appendChild(track.attach());
      }
    });
  
    participant.on('trackSubscribed', track => {
      document.getElementById('remote-media-div').appendChild(track.attach());
    });
  
  }

  function participantDisconnected(participant) {
    console.log('Participant "%s" disconnected', participant.identity);
    document.getElementById(participant.sid).remove();
  }

  function trackSubscribed(div, track) {
    div.appendChild(track.attach());
  }

  function trackUnsubscribed(track) {
    track.detach().forEach(element => element.remove());
  }
};
