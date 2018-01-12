const Crypto = require("crypto");

module.exports = class Lobby {

  constructor(code) {

    this.code = code;
    this.isWaiting = true;
    this.token = Crypto.randomBytes(20).toString('hex');

  }

}
