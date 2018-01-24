const Lobby = require('./lobby');

// Exports Game Class
module.exports = class Game {

  /**
   * Constructs a Game Instance
   * @constructor
   * @param {WebSocketServer} wss - The websocket server
   */
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
        } else if (data.token && this._verify(data)) { // If data is verified give it the the correct lobby
          this.lobbys[data.lobby].handleData(ws, data);
        }

      });

    });

  }

  /**
   * Sends Data to a Socket
   * @param {WebSocket} ws - The socket to send to
   * @param {Object} data - The data
   */
  _send(ws, data) {
    ws.send(JSON.stringify(data)); // Convert data to string
  }

  /**
   * Gets the Status of a Lobby
   * @param {string} code - The lobby code
   * @returns {string} The status
   */
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

  /**
   * Verify If the Data is Valid
   * @param {Object} data - Contains creds to validate
   * @returns {boolean} If data is valid
   */
  _verify(data) {
    return this.lobbys[data.lobby] && this.lobbys[data.lobby].token == data.token;
  }

  /**
   * Adds Lobby
   * @param {string} code - Lobby code
   * @param {boolean} [cpu=false] - If the lobby should contain a CPU player
   * @returns {boolean} If lobby exists
   */
  addLobby(code, cpu = false) {

    let status = this._retrieve_status(code);

    if (status == 'waiting' && !cpu) {
      return true;
    } else if (status == 'open') {
      this.lobbys[code] = new Lobby(code, this, cpu); // Creates a new lobby
      return true;
    } else {
      return false;
    }

  }

  /**
   * Removes Lobby
   * @param {string} code - Lobby code
   */
  removeLobby(code) {
    delete this.lobbys[code];
  }

}
