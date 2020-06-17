
const Video = Twilio.Video;

$(document).ready(() => {
  console.log("ready!");
});

const getAccessToken = () => {
  console.log("Getting Access Token");

  const http = new XMLHttpRequest();
  const url = "http://127.0.0.1:3000";

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
    console.log('Connected to Room "%s"', room.name);

    room.participants.forEach(participantConnected);
    room.on("participantConnected", participantConnected);

    room.on("participantDisconnected", participantDisconnected);
    room.once("disconnected", error => room.participants.forEach(participantDisconnected));
  });

  function participantConnected(participant) {
    console.log('Participant "%s" connected', participant.identity);

    const div = document.createElement("div");
    div.id = participant.sid;
    div.innerText = participant.identity;

    participant.on("trackSubscribed", track => trackSubscribed(div, track));
    participant.on("trackUnsubscribed", trackUnsubscribed);

    participant.tracks.forEach(publication => {
      if (publication.isSubscribed) {
        trackSubscribed(div, publication.track);
      }
    });

    document.body.appendChild(div);
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
