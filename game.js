const Lobby = require('./lobby');

module.exports = class Game {

  constructor(wss) {

    this.wss = wss;
    this.lobbys = {};

    wss.on('connection', (ws, req) => {

      ws.on('message', (message) => {

        let data = JSON.parse(message);

        console.log(data);

        if(data.cmd == 'status') {
          this._send(ws, {
            cmd: 'status',
            status: this._retrieve_status(data.lobby)
          });
        }

      });

    });

  }

  _send(ws, data) {
    ws.send(JSON.stringify(data));
  }

  _retrieve_status(code) {

    if(/^\w{5}$/.test(code)) {

      let lobby = this.lobbys[code];

      if(lobby && lobby.isWaiting) {
        return 'waiting';
      } else {
        return 'open';
      }

    }

    return 'closed';

  }

  addLobby(code) {

    let status = this._retrieve_status(code);

    if(status == 'waiting') {
      return true;
    } else if(status == 'open') {
      this.lobbys[code] = new Lobby();
      return true;
    } else {
      return false;
    }

  }

}
