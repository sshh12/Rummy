const Lobby = require('./lobby');

module.exports = class Game {

  constructor(wss) {

    this.wss = wss;
    this.lobbys = {};

    wss.on('connection', (ws, req) => {

      this._send(ws, {
        cmd: 'connected'
      })

      ws.on('message', (message) => {

        let data = JSON.parse(message);

        if (data.cmd == 'status') {
          this._send(ws, {
            cmd: 'status',
            status: this._retrieve_status(data.lobby)
          });
        } else if (data.token && this._verify(data)) {
          this.lobbys[data.lobby].handleData(ws, data);
        }

      });

    });

  }

  _send(ws, data) {
    ws.send(JSON.stringify(data));
  }

  _retrieve_status(code) {

    if (/^\w{5,12}$/.test(code)) {

      let lobby = this.lobbys[code];

      if (lobby) {
        return lobby.isWaiting ? 'waiting' : 'closed';
      } else {
        return 'open';
      }

    }

    return 'closed';

  }

  _verify(data) {
    return this.lobbys[data.lobby] && this.lobbys[data.lobby].token == data.token;
  }

  addLobby(code, cpu = false) {

    let status = this._retrieve_status(code);

    if (status == 'waiting' && !cpu) {
      return true;
    } else if (status == 'open') {
      this.lobbys[code] = new Lobby(code, this, cpu);
      return true;
    } else {
      return false;
    }

  }

  removeLobby(code) {
    delete this.lobbys[code];
  }

}
