class MeetingController {
  Video;

  _roomName;
  _room;

  _hisName;
  _hisPhone;
  _herName;
  _herPhone;

  currentUserName;

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

class DatabaseController {
  _firestore;

  _meeting;

  constructor(firestore, meeting) {
    this._firestore = firestore;
    this._meeting = meeting;
  }

  sendMessage(payload) {
    console.log("Sending...", payload);
    this._firestore
      .collection("meetings")
      .doc(this._meeting.meetingId)
      .collection("messages")
      .add(JSON.parse(JSON.stringify({ ...payload, createdAt: new Date() })));
  }

  setMessageHandler(handler) {
    this._firestore
      .collection("meetings")
      .doc(this._meeting.meetingId)
      .collection("messages")
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === "added") {
            handler({ ...change.doc.data(), messageId: change.doc.id });
          }
        });
      });
  }

  startGame(gameName, sender) {
    console.log("Starting Game", gameName);
    this._firestore
      .collection("meetings")
      .doc(this._meeting.meetingId)
      .collection("games")
      .add({ gameName, sender, createdAt: new Date(), status: "OPEN" });
  }

  endGame(gameId, sender) {
    console.log("Ending Game", gameId);
    this._firestore
      .collection("meetings")
      .doc(this._meeting.meetingId)
      .collection("games")
      .doc(gameId)
      .update({ status: "CLOSE" });
  }

  setGameListener(onStart, onEnd) {
    this._firestore
    .collection("meetings")
    .doc(this._meeting.meetingId)
    .collection("games")
    .onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === "added") {
          console.log('Added Game', change.doc.id, change.doc.data());
          onStart({...change.doc.data(), gameId: change.doc.id});
        } else if (change.type === "modified" && change.doc.data().status === "CLOSE") {
          console.log('Modified Game', change.doc.id, change.doc.data());
          onEnd();
        }
      });
    });
  }
}

let meetingController = new MeetingController(Twilio.Video);
let gameStarted = false;

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
      meetingController.currentUserName = data.meeting.herName;
      startConference(data.meeting, data.jwt);
    }
  };
};

const startConference = (meeting, token) => {
  meetingController.startMeeting(meeting.roomName, token);
  $("#start_div").hide();

  let databaseController = new DatabaseController(firebase.firestore(), meeting);
  databaseController.setGameListener(startGame, endGame);

  window.databaseController = databaseController;
  window.meetingController = meetingController;

  //startGame("cooking");
};

function startGame(game) {
  if (gameStarted) return;
  gameStarted = true;
  window.game = game;
  const iframe = document.createElement("iframe");
  iframe.id = 'gameframe';
  iframe.src = "https://savethedate-91944.web.app/games/cooking/index.html?token=1";
  document.getElementById("game").appendChild(iframe);
}

function endGame() {
  gameStarted = false;
  document.getElementById('gameframe').remove();
}

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
      const data = JSON.parse(this.response);
      console.log(data);
      meetingController.currentUserName = body.hisName;
      startConference(data.meeting, data.jwt);
    }
  });

  xhr.open("POST", "https://us-central1-savethedate-91944.cloudfunctions.net/app/create-room");
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.send(JSON.stringify(body));
}
//dont forget picture
function getStart() {
  document.getElementById("display_div").style.display="block";
  createRoom();
}
//turnAudio

function turnOffAudio() {
  meetingController.mute();
}

function turnOnAudio() {
  meetingController.unmute();
}
