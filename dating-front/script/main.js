class MeetingController {
  Video;

  _roomName;
  _room;

  _hisName;
  _hisPhone;
  _herName;
  _herPhone;

  constructor(videoInstance) {
    this.Video = videoInstance;
  }

  setParticipantsData(hisName, hisPhone, herName, herPhone) {
    this._hisName = hisName;
    this._hisPhone = hisPhone;
    this._herName = herName;
    this._herPhone = herPhone;
  }

  startMeeting(roomName, token) {
    this._roomName = roomName;
    return this.Video.connect(
      token,
      { name: roomName }
    )
      .then(room => {
        this._room = room;
        console.log("Connected to Room", room);

        generateUrl(roomName);

        this.Video.createLocalVideoTrack().then(track => {
          const localMediaContainer = document.getElementById("local-media");
          localMediaContainer.appendChild(track.attach());
        });

        room.participants.forEach(this.participantConnected);
        room.on("participantConnected", this.participantConnected);

        room.on("participantDisconnected", this.participantDisconnected);
        room.once("disconnected", error => room.participants.forEach(this.participantDisconnected));
      })
      .catch(e => {
        console.error("Error startMeeting", e);
      });
  }

  endMeeting() {}

  mute() {
    this._room.localParticipant.audioTracks.forEach(publication => {
      publication.track.disable();
    });
  }

  unmute() {
    this._room.localParticipant.audioTracks.forEach(publication => {
      publication.track.enable();
    });
  }

  participantConnected(participant) {
    console.log(`Participant "${participant.identity}" connected`);

    participant.tracks.forEach(publication => {
      if (publication.isSubscribed) {
        const track = publication.track;
        document.getElementById("remote-media-div").appendChild(track.attach());
      }
    });

    participant.on("trackSubscribed", track => {
      document.getElementById("remote-media-div").appendChild(track.attach());
    });
  }

  participantDisconnected(participant) {
    console.log('Participant "%s" disconnected', participant.identity);
    document.getElementById(participant.sid).remove();
  }

  trackSubscribed(div, track) {
    div.appendChild(track.attach());
  }

  trackUnsubscribed(track) {
    track.detach().forEach(element => element.remove());
  }
}

let meetingController = new MeetingController(Twilio.Video);

$(document).ready(() => {
  console.log("ready!");

  const url = location.href;
  console.log("Url", url);

  if (url.indexOf("room") === -1) return;

  const room = url.split("room/").pop();
  if (room == "") return;

  console.log(room);

  getAccessToken(room);
});

const getAccessToken = room => {
  console.log("Getting Access Token");

  const http = new XMLHttpRequest();
  const url = "https://us-central1-savethedate-91944.cloudfunctions.net/app/enter-room/?room=" + room;

  http.open("GET", url);
  http.send();

  http.onreadystatechange = (e, ev) => {
    if (http.readyState === XMLHttpRequest.DONE) {
      const data = JSON.parse(http.response);
      console.log(data);
      startConference(data.meeting, data.jwt);
    }
  };
};

const startConference = (meeting, token) => {
  meetingController.startMeeting(meeting.roomName, token);
};

function generateUrl(name) {
  const url = "https://savethedate-91944.web.app/room/" + name;
  alert(url);
}

function createRoom() {
  const roomName = new Date().getTime();
  let hisName, herName, hisPhone, herPhone;
  hisName = document.getElementById(`hisName`).value;
  hisPhone = document.getElementById(`hisPhone`).value;
  herName = document.getElementById(`herName`).value;
  herPhone = document.getElementById(`herPhone`).value;
  let body = {
    hisName: hisName,
    herName: herName,
    hisPhone: hisPhone,
    herPhone: herPhone,
    roomName: roomName
  };

  var xhr = new XMLHttpRequest();

  xhr.addEventListener("readystatechange", function() {
    if (this.readyState === 4) {
      const data = JSON.parse(this.response)
      console.log(data);
      meetingController.startMeeting(roomName, data.jwt);
    }
  });

  xhr.open("POST", "https://us-central1-savethedate-91944.cloudfunctions.net/app/create-room");
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.send(JSON.stringify(body));
}

function getStart() {
  createRoom();
  $("#start_div").hide();
  //$("#start_div").slideUp('slow', createRoom);
}
//turnAudio

function turnOffAudio() {
  meetingController.mute();
}

function turnOnAudio() {
  meetingController.unmute();
}
