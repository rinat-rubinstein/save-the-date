
const Video = Twilio.Video;

$(document).ready(() => {
  console.log("ready!");

  const url = location.href;
  console.log('Url', url);

  if (url.indexOf('room') === -1) return;

  const room = url.split('room/').pop();
  if (room == '') return;

  console.log(room);
  
  getAccessToken(room);
});

const getAccessToken = (room) => {
  const name = room ?? new Date().getTime();
  console.log("Getting Access Token");

  const http = new XMLHttpRequest();
  const url = "https://us-central1-savethedate-91944.cloudfunctions.net/app?room=" + name;

  http.open("GET", url);
  http.send();

  http.onreadystatechange = (e, ev) => {
    if (http.readyState === XMLHttpRequest.DONE) {
      console.log(http.response);
      startConference(name, http.response);
    }
  };
};

const startConference = (name, token) => {
  Video.connect(
    token,
    { name }
  ).then(room => {
    console.log('Connected to Room', room);

    generateUrl(name);

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

function generateUrl(name) {
  const url = 'https://savethedate-91944.web.app/room/' + name;
  alert(url);
}