class GameController {
  _token;
  _databaseController;
  _meetingController;

  _gameName;
  _gameId;

  messages = [];

  constructor(token) {
    this._token = token;
    if (parent.databaseController !== undefined) {
      this._databaseController = parent.databaseController;
    } else {
      alert("Database Controller not defined");
    }
    if (parent.meetingController !== undefined) {
        this._meetingController = parent.meetingController;
      } else {
        alert("Meeting Controller not defined");
      }
  }

  startGame(gameName) {
    this._gameName = gameName;
    try {
      this._databaseController.startGame(gameName, this._meetingController.currentUserName);
    } catch (e) {
      console.error(e);
    }
  }

  endGame() {
    try {
      this._databaseController.endGame(parent.game.gameId, this._meetingController.currentUserName);
    } catch (e) {
      console.error(e);
    }
  }

  sendMessage(payload) {
    try {
      this._databaseController.sendMessage({...payload, sender: this._meetingController.currentUserName});
    } catch (e) {
      console.error(e);
    }
  }

  setMessageHandler(handler) {
    this._databaseController.setMessageHandler((payload) => {
        if (payload.sender === this._meetingController.currentUserName) return;
        if (this.messages.indexOf(payload.messageId) === -1) {
            this.messages.push(payload.messageId);
            handler(payload);
        }
    });
  }
}
