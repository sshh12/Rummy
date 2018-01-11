module.exports = class Game {

  constructor(wss) {

    this.wss = wss;
    this.lobbys = {
      'abc12': { isWaiting: true },
      '12345': { isWaiting: false }
    };

    wss.on('connection', (ws, req) => {

      ws.on('message', (message) => {

        console.log(message);

        let data = JSON.parse(message);

        if(data.cmd == 'status') {
          this._retrieve_status(ws, data);
        }

      });

    });

  }

  _send(ws, data) {
    ws.send(JSON.stringify(data));
  }

  _retrieve_status(ws, data) {

    let code = data.lobby;

    if(/^\w{5}$/.test(code)) {

      let lobby = this.lobbys[code];

      if(lobby) {

        if(lobby.isWaiting){
          this._send(ws, {
            cmd: 'status',
            status: 'waiting'
          });
        } else {
          this._send(ws, {
            cmd: 'status',
            status: 'playing'
          });
        }
      } else {
        this._send(ws, {
          cmd: 'status',
          status: 'open'
        });
      }

    }

  }

}
