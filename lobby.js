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

    if (data.cmd == 'join') {

      if (!this.isWaiting || this.sockets.indexOf(null) == -1) {

        this._send(ws, {
          cmd: 'exit'
        });

      } else {

        this.sockets[this.sockets.indexOf(null)] = ws;
        if (this.sockets.indexOf(null) == -1) {
          this.isWaiting = false;
        }

        this._send(ws, {
          cmd: 'cards',
          cards: this.playerCards[this.sockets.indexOf(ws)],
          opcards: this.playerCards[this.sockets.indexOf(ws) ^ 1].length,
          deck: this.deck.length,
          melds: this.melds,
          draw: this.draw
        });

      }

    } else if (data.cmd == 'click' && this.sockets.indexOf(ws) == this.turn) {

      let playerIndex = this.sockets.indexOf(ws);

      if (this.choosePhase) {

        if (data.button == 'left' && data.card == 'deck' && this.deck.length > 0) {

          let nextCard = this.deck.pop();
          this.playerCards[playerIndex].push(nextCard);

          this._send(this.sockets[playerIndex], {
            cmd: 'draw',
            from: 'deck',
            player: 'me',
            card: nextCard
          });
          this._send(this.sockets[playerIndex ^ 1], {
            cmd: 'draw',
            from: 'deck',
            player: 'op'
          });
          this.choosePhase = false;

        } else if (data.button == 'left' && data.card != 'deck' && this._getCard(this.draw, data) != null && this.draw.length > 0) {

          let nextCard = this.draw.pop();
          this.playerCards[playerIndex].push(nextCard);

          this._send(this.sockets[playerIndex], {
            cmd: 'draw',
            from: 'draw',
            player: 'me',
            card: nextCard
          });
          this._send(this.sockets[playerIndex ^ 1], {
            cmd: 'draw',
            from: 'draw',
            player: 'op'
          });
          this.choosePhase = false;

        }

      } else {

        let card = this._getCard(this.playerCards[playerIndex], data);

        if (card != null) {

          if(data.button == 'left') {

            this.playerCards[playerIndex].splice(this.playerCards[playerIndex].indexOf(card), 1);
            this.draw.push(card);

            this._send(this.sockets[playerIndex], {
              cmd: 'discard',
              player: 'me',
              card: card
            });
            this._send(this.sockets[playerIndex ^ 1], {
              cmd: 'discard',
              player: 'op',
              card: card
            });
            this.choosePhase = true;
            this.turn ^= 1;

          } else {

            let newMeld = this._create_new_meld(this.playerCards[playerIndex], card);

            if(newMeld.length >= 3) {

              this._sortDeck(newMeld);

              for(let card of newMeld) {
                this.playerCards[playerIndex].splice(this.playerCards[playerIndex].indexOf(card), 1);
              }
              this.melds.push(newMeld);

              this._send(this.sockets[playerIndex], {
                cmd: 'newmeld',
                player: 'me',
                meld: newMeld
              });
              this._send(this.sockets[playerIndex ^ 1], {
                cmd: 'newmeld',
                player: 'op',
                meld: newMeld
              });

            } else {

              let meld = this._create_similar_meld(card);
              if(meld.index >= 0) {

                this.playerCards[playerIndex].splice(this.playerCards[playerIndex].indexOf(card), 1);
                this.melds[meld.index] = meld.meld;

                this._send(this.sockets[playerIndex], {
                  cmd: 'addmeld',
                  player: 'me',
                  index: meld.index,
                  card: card
                });
                this._send(this.sockets[playerIndex ^ 1], {
                  cmd: 'addmeld',
                  player: 'op',
                  index: meld.index,
                  card: card
                });

              }

            }

          }

        }

      }

    }

  }

  _send(ws, data) {
    if (ws !== null) {
      ws.send(JSON.stringify(data));
    }
  }

  _getCard(collection, targetCard) {
    for (let card of collection) {
      if (card.suit == targetCard.suit && card.rank == targetCard.rank) {
        return card;
      }
    }
    return null;
  }

  _sortDeck(deck) {
    deck.sort((a, b) => {
      if (a.rank != b.rank){
         return this.cardRanks.indexOf(a.rank) - this.cardRanks.indexOf(b.rank);
      } else {
         return a.suit - b.suit;
      }
    });
  }

  _create_new_meld(cards, targetCard, rankIndex = null) {

    let isCard = (deck, index) => this._getCard(deck, {suit: targetCard.suit, rank: this.cardRanks[index]}) != null;

    let suitMeld = [targetCard]

    let index = rankIndex || this.cardRanks.indexOf(targetCard.rank),
        lowerIndex = index - 1,
        upperIndex = index + 1;

    while(lowerIndex >= 0 && isCard(cards, lowerIndex)) {
      suitMeld.unshift(this._getCard(cards, {suit: targetCard.suit, rank: this.cardRanks[lowerIndex]}));
      lowerIndex--;
    }

    while(upperIndex < this.cardRanks.length && isCard(cards, upperIndex)) {
      suitMeld.push(this._getCard(cards, {suit: targetCard.suit, rank: this.cardRanks[upperIndex]}));
      upperIndex++;
    }

    if(rankIndex == null && targetCard.rank == 'A') {
      let otherMeld = this._create_new_meld(cards, targetCard, rankIndex=this.cardRanks.indexOf('A', 2));
      if(otherMeld.length > suitMeld.length) {
        suitMeld = otherMeld;
      }
    }

    let rankMeld = cards.filter((card) => card.rank == targetCard.rank);

    if(rankMeld.length >= suitMeld.length) {
      return rankMeld;
    } else {
      return suitMeld;
    }

  }

  _create_similar_meld(targetCard, rankIndex = null) {

    let index = rankIndex || this.cardRanks.indexOf(targetCard.length);

    for(let i = 0; i < this.melds.length; i++) {

      let meld = this.melds[i].slice(0);

      if(meld[0].rank != meld[meld.length - 1].rank){

        if(meld[0].suit == targetCard.suit) {

          let firstRankIndex = this.cardRanks.indexOf(meld[0].rank),
              lastRankIndex = this.cardRanks.indexOf(meld[meld.length - 1].rank);

          if(firstRankIndex - 1 == index) {
            meld.unshift(targetCard);
            this._sortDeck(meld);
            return {index: i, meld: meld};
          } else if(lastRankIndex + 1 == index) {
            meld.push(targetCard);
            this._sortDeck(meld);
            return {index: i, meld: meld};
          }

        }

      } else if(meld[0].rank == targetCard.rank) {

        meld.push(targetCard);
        this._sortDeck(meld);
        return {index: i, meld: meld};

      }

    }

    if(rankIndex == null && targetCard.rank == 'A') {
      return this._create_similar_meld(targetCard, rankIndex=this.cardRanks.indexOf('A', 2))
    }

    return {index: -1};

  }

  _genCards() {

    this.cardRanks = ['A', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    let cards = [];

    for (let suit of ['spade', 'heart', 'diamond', 'club']) {

      for (let i = 2; i <= 10; i++) {
        cards.push({
          html: `.card._${i}.${suit}`,
          suit: suit,
          rank: "" + i
        });
      }

      for (let face of ['A', 'J', 'Q', 'K']) {
        cards.push({
          html: `.card._${face}.${suit}`,
          suit: suit,
          rank: face
        });
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

    this.melds = [];

    this.draw = cards.splice(0, 1);
    this.deck = cards;

  }

}
