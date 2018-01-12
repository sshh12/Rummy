const Crypto = require("crypto");

module.exports = class Lobby {

  constructor(code) {

    this.code = code;
    this.isWaiting = true;
    this.token = Crypto.randomBytes(22).toString('hex');
    this.sockets = [];
    this._gen_cards();

  }

  handleData(ws, data) {

    if(data.cmd == 'join') {
      if(!this.isWaiting || this.sockets == 2) {
        this._send(ws, {cmd: 'exit'});
      } else {
        this.sockets.push(ws);
        if(this.sockets.length == 2) {
          this.isWaiting = false;
        }
        this._send(ws, {cmd: 'join', cards: this.playerCards[this.sockets.length - 1]});
      }
    }

  }

  _send(ws, data) {
    ws.send(JSON.stringify(data));
  }

  _gen_cards() {

    let cards = [];

    for(let suit of ['spade', 'heart', 'diamond', 'club']) {

      for(let i = 2; i <= 10; i++){
        cards.push({html: `.card._${i}.${suit}`, suit: suit, rank: "" + i});
      }

      for(let face of ['A', 'J', 'Q', 'K']){
        cards.push({html: `.card._${face}.${suit}`, suit: suit, rank: face});
      }

    }

    for (let i = cards.length - 1; i > 0; i--) { // Shuffle
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    this.playerCards = [
      cards.splice(0, 10),
      cards.splice(0, 10)
    ];

    console.log(cards);

  }

}
