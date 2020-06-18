class MeetingController {
  Video;

  _roomName;
  _room;

  _hisName;
  _hisPhone;
  _herName;
  _herPhone;

  constructor(videoInstance) {
    Video = videoInstance;
  }

  setParticipantsData(hisName, hisPhone, herName, herPhone) {
    this._hisName = hisName;
    this._hisPhone = hisPhone;
    this._herName = herName;
    this._herPhone = herPhone;
  }

  startMeeting(roomName, token) {
    this._roomName = roomName;
    return Video.connect(
      token,
      { name: roomName }
    ).then(room => {
      this._room = room;
      console.log('Connected to Room', room);

      generateUrl(roomName);

      Video.createLocalVideoTrack().then(track => {
        const localMediaContainer = document.getElementById('local-media');
        localMediaContainer.appendChild(track.attach());

      });

      room.participants.forEach(this.participantConnected);
      room.on("participantConnected", this.participantConnected);

      room.on("participantDisconnected", this.participantDisconnected);
      room.once("disconnected", error => room.participants.forEach(this.participantDisconnected));
    }).catch(e => {
      console.error('Error startMeeting', e);
    })

  }

  endMeeting() { }

  mute() {
    this._room.localParticipant.audioTracks.forEach((publication) => { publication.track.disable(); });
  }

  unmute() {
    this._room.localParticipant.audioTracks.forEach((publication) => { publication.track.enable(); });
  }

  participantConnected(participant) {
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
  console.log('Url', url);

  if (url.indexOf('room') === -1) return;

  const room = url.split('room/').pop();
  if (room == '') return;

  console.log(room);

  getAccessToken(room);
});

const getAccessToken = (room) => {
  console.log("Getting Access Token");

  const http = new XMLHttpRequest();
  const url = "https://us-central1-savethedate-91944.cloudfunctions.net/app?room=" + room;

  http.open("GET", url);
  http.send();

  http.onreadystatechange = (e, ev) => {
    if (http.readyState === XMLHttpRequest.DONE) {
      console.log(http.response);
      startConference(room, http.response);
    }
  };
};

const startConference = (name, token) => {
  meetingController.startMeeting(name, token);
};

function generateUrl(name) {
  const url = 'https://savethedate-91944.web.app/room/' + name;
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
    hisName,
    herName,
    hisPhone,
    herPhone,
    roomName,
  }
  const http = new XMLHttpRequest();

  http.open("POST", 'https://us-central1-savethedate-91944.cloudfunctions.net/app/create-room', true);
  http.setRequestHeader("Content-type", "application/json");
  if (http.readyState == 4 && http.status == 200) {
    console.log(http.response);
    meetingController.startMeeting(roomName,http.response.jwt);
  }
  http.send(body);

}

function getStart() {
  $("#start_div").slideUp('slow', createRoom);
}
//turnAudio

function turnOffAudio() {
  meetingController.mute();
}

function turnOnAudio() {
  meetingController.unmute();
}