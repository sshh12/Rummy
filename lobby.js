const Crypto = require("crypto");

module.exports = class Lobby {

  constructor(code) {

    this.code = code;
    this.token = Crypto.randomBytes(22).toString('hex');

    this.sockets = [null, null];
    this.isWaiting = true;
    this.choosePhase = true;
    this.turn = 0;

    this._genCards();

  }

  handleData(ws, data) {

    if(data.cmd == 'join') {

      if(!this.isWaiting || this.sockets.indexOf(null) == -1) {

        this._send(ws, {cmd: 'exit'});

      } else {

        this.sockets[this.sockets.indexOf(null)] = ws;
        if(this.sockets.indexOf(null) == -1) {
          this.isWaiting = false;
        }

        this._send(ws, {
          cmd: 'cards',
          cards: this.playerCards[this.sockets.indexOf(ws)],
          opcards: this.playerCards[this.sockets.indexOf(ws) ^ 1].length,
          deck: this.deck.length,
          groups: this.groups,
          draw: this.draw
        });

      }

    } else if(data.cmd == 'click' && this.sockets.indexOf(ws) == this.turn) {

      let playerIndex = this.sockets.indexOf(ws);

      if(this.choosePhase) {

        if(data.card == 'deck' && this.deck.length > 0) {

          let nextCard = this.deck.pop();
          this.playerCards[playerIndex].push(nextCard);

          this._send(this.sockets[playerIndex], {cmd: 'draw', from: 'deck', player: 'me', card: nextCard});
          this._send(this.sockets[playerIndex ^ 1], {cmd: 'draw', from: 'deck', player: 'op'});
          this.choosePhase = false;

        } else if(data.card != 'deck' && this._getCard(this.draw, data) != null && this.draw.length > 0) {

          let nextCard = this.draw.pop();
          this.playerCards[playerIndex].push(nextCard);

          this._send(this.sockets[playerIndex], {cmd: 'draw', from: 'draw', player: 'me', card: nextCard});
          this._send(this.sockets[playerIndex ^ 1], {cmd: 'draw', from: 'draw', player: 'op'});
          this.choosePhase = false;

        }

      } else {

        let card = this._getCard(this.playerCards[playerIndex], data);

        if(card != null) {

          this.playerCards[playerIndex].splice(this.playerCards[playerIndex].indexOf(card), 1);
          this.draw.push(card);

          this._send(this.sockets[playerIndex], {cmd: 'discard', player: 'me', card: card});
          this._send(this.sockets[playerIndex ^ 1], {cmd: 'discard', player: 'op', card: card});
          this.choosePhase = true;
          this.turn ^= 1;

        }

      }

    }

  }

  _send(ws, data) {
    if(ws !== null) {
      ws.send(JSON.stringify(data));
    }
  }

  _getCard(collection, targetCard) {
    for(let card of collection) {
      if(card.suit == targetCard.suit && card.rank == targetCard.rank) {
        return card;
      }
    }
    return null;;
  }

  _genCards() {

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

    this.groups = [];

    this.draw = cards.splice(0, 1);
    this.deck = cards;

  }

}
