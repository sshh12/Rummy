const Crypto = require("crypto");

// Exports Lobby Class
module.exports = class Lobby {

  /**
   * Constructs a Game Instance
   * @constructor
   * @param {string} code - The lobby code
   * @param {Game} game - The main Rummy Game
   * @param {boolean} isCPU - If the game is vs bot
   */
  constructor(code, game, isCPU) {

    this.code = code;
    this.cpu = isCPU;
    this.game = game;
    this.token = Crypto.randomBytes(22).toString('hex'); // Generate random lobby code

    this.sockets = [null, null];
    this.isWaiting = true;
    this.choosePhase = true;
    this.turn = 0;

    this.selfDestruct = null;

    this._genCards();

  }

  /**
   * Main Method for Handling Data
   * @param {WebSocket} ws - The clients websocket
   * @param {Object} data - The data recieved
   */
  handleData(ws, data) {

    clearTimeout(this.selfDestruct);  // Continue to postpone self destruct until no data is sent
    this.selfDestruct = setTimeout(() => {
      this._doSelfDistruct();
    }, 300 * 1000);

    this._ensure_players();

    if (data.cmd == 'join') {

      this._process_join(ws);

    } else if (data.cmd == 'click' && this.sockets.indexOf(ws) == this.turn) {

      let playerIndex = this.sockets.indexOf(ws);

      if (this.choosePhase) {

        this._process_choose_phase(playerIndex, data);

      } else {

        let card = this._getCard(this.playerCards[playerIndex], data);

        if (card != null) {

          if(data.button == 'left') {

            this._process_discard(playerIndex, card);

          } else {

            this._process_meld(playerIndex, card);

          }

          this._check_win();

        }

      }

    }

  }

  /**
   * Sends Data to Client
   * @param {WebSocket} ws - The clients websocket
   * @param {Object} data - The data to send
   * @returns {boolean} If data was sent
   */
  _send(ws, data) {
    if (ws !== null) {
      try {
        ws.send(JSON.stringify(data));
        return true;
      } catch (e) {
        // oops..
      }
    }
    return false;
  }

  /**
   * Finds Card that Matches
   * @param {Card[]} cards - A collection of cards
   * @param {Card} targetCard - The query card
   * @returns {?Card} A card from cards that matches targetCard
   */
  _getCard(cards, targetCard) {
    for (let card of cards) {
      if (card.suit == targetCard.suit && card.rank == targetCard.rank) {
        return card;
      }
    }
    return null;
  }

  /**
   * Finds Card that Matches
   * @param {Card[]} cards - A collection of cards
   * @param {string} suit - A card suit
   * @param {number} value - A card value
   * @returns {?Card} A card from cards that matches given inputs
   */
  _getCardByValue(cards, suit, value) {
    for (let card of cards) {
      if (card.suit == suit && card.value == value) {
        return card;
      }
    }
    return null;
  }

  /**
   * In-Place Sorts Cards
   * @param {Card[]} deck - A collection of cards
   */
  _sortDeck(deck) {
    deck.sort((a, b) => {
      if (a.rank != b.rank){
         return a.value - b.value;
      } else {
         return a.suit - b.suit;
      }
    });
  }

  /**
   * Destroys and Removes This Lobby
   */
  _doSelfDistruct() {
    console.log("Removing Lobby", this.code);
    for(let socket of this.sockets) {
      if(socket != null) {
        socket.terminate();
      }
    }
    this.game.removeLobby(this.code);
  }

  /**
   * Checks and Ensures Players (websockets) are Connected
   */
  _ensure_players() {

    if(this.cpu) {

      try {
        this._send(this.sockets[0], {cmd: 'ping'});
      } catch (e) {
        this._doSelfDistruct();
      }

    } else {

      for(let i = 0; i < this.sockets.length; i++) {

        if(this.sockets[i] != null) {

          try {
            this._send(this.sockets[i], {cmd: 'ping'});
          } catch (e) {
            this.isWaiting = true;
            this.sockets[i] = null;
          }

        }

      }

    }

  }

  /**
   * Calculates Card Score
   * @param {Card[]} cards - Cards
   * @returns {number} Total number of points from the cards
   */
  _calculate_card_score(cards) {

    let sum = 0;

    for(let card of cards) {

      if(card.rank == 'A') {
        sum += 1;
      } else if(card.rank == 'J' || card.rank == 'K' || card.rank == 'Q') {
        sum += 10;
      } else {
        sum += card.value + 1;
      }

    }

    return sum;

  }

  /**
   * Checks If a Player Won and then Sends Win/Loss Data
   */
  _check_win() {
    for(let i = 0; i < this.playerCards.length; i++) {
      if(this.playerCards[i].length == 0) {
        this._send(this.sockets[i], {cmd: 'win', score: this._calculate_card_score(this.playerCards[i ^ 1])});
        this._send(this.sockets[i ^ 1], {cmd: 'loss'});
        this._doSelfDistruct();
        break;
      }
    }
  }

  /**
   * Handles a Client Joining
   * @param {WebSocket} ws - The client socket
   */
  _process_join(ws) {

    if (!this.isWaiting || this.sockets.indexOf(null) == -1) { // If lobby full -> tell new client to leave

      this._send(ws, {
        cmd: 'exit'
      });

    } else {

      this.sockets[this.sockets.indexOf(null)] = ws; // Add client to lobby via its Websocket
      if (this.sockets.indexOf(null) == -1 || this.cpu) {
        this.isWaiting = false;
      }

      this._send(ws, { // Send copy of current deck and layout to new client
        cmd: 'cards',
        cards: this.playerCards[this.sockets.indexOf(ws)],
        opcards: this.playerCards[this.sockets.indexOf(ws) ^ 1].length,
        deck: this.deck.length,
        melds: this.melds,
        draw: this.draw,
        myturn: this.sockets.indexOf(ws) == this.turn
      });

    }

  }

  /**
   * Handles the Choose a Card Phase
   * @param {number} playerIndex - The player choosing
   * @param {Object} data - Data associated w/choice
   */
  _process_choose_phase(playerIndex, data) {

    if (data.button == 'left' && data.card == 'deck' && this.deck.length > 0) { // Draw from deck

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

    } else if (data.button == 'left' && data.card != 'deck' && this._getCard(this.draw, data) != null && this.draw.length > 0) { // Draw from pile

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

  }

  /**
   * Handles Discarding a Card
   * @param {number} playerIndex - The player discarding
   * @param {Card} card - The card being discarded
   */
  _process_discard(playerIndex, card) {

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

    if(this.turn == 1 && this.cpu) {
      this._play_cpu_turn();
    }

  }

  /**
   * Handles Creating a Meld
   * @param {number} playerIndex - The player attempting to meld
   * @param {Card} card - The card to be melded
   */
  _process_meld(playerIndex, card) {

    let newMeld = this._create_new_meld(this.playerCards[playerIndex], card);

    if(newMeld.length >= 3) { //-> Create a new meld

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

    } else { //-> See if this card can be added to a meld

      let meld = this._create_similar_meld(card);
      if(meld.index >= 0) {

        this.playerCards[playerIndex].splice(this.playerCards[playerIndex].indexOf(card), 1);
        this.melds[meld.index] = meld.meld;

        this._send(this.sockets[playerIndex], {
          cmd: 'addmeld',
          player: 'me',
          index: meld.index,
          card: card,
          meld: meld.meld
        });
        this._send(this.sockets[playerIndex ^ 1], {
          cmd: 'addmeld',
          player: 'op',
          index: meld.index,
          card: card,
          meld: meld.meld
        });

      }

    }

  }

  /**
   * Creates The Best Meld with Given Card
   * @param {Card[]} cards - The player's cards
   * @param {Card} targetCard - The card used to spawn a meld
   * @returns {Card[]} A meld
   */
  _create_new_meld(cards, targetCard) {

    let isCard = (deck, suit, value) => this._getCardByValue(deck, suit, value) != null;

    let suitMeld = [targetCard];

    /*----------Finding Longest Sequence For Suit Meld-----------*/
    let index = targetCard.value,
        lowerIndex = index - 1,
        upperIndex = index + 1;

    while(lowerIndex >= 0 && isCard(cards, targetCard.suit, lowerIndex)) {
      suitMeld.unshift(this._getCard(cards, {suit: targetCard.suit, rank: this.cardRanks[lowerIndex]}));
      lowerIndex--;
    }

    while(upperIndex < this.cardRanks.length && isCard(cards, targetCard.suit, upperIndex)) {
      suitMeld.push(this._getCard(cards, {suit: targetCard.suit, rank: this.cardRanks[upperIndex]}));
      upperIndex++;
    }
    /*-----------------------------------------------------------*/

    if(targetCard.value == 0) { // If it's an Ace try flipping its value
      targetCard.value = 14;
      let otherMeld = this._create_new_meld(cards, targetCard);
      if(otherMeld.length > suitMeld.length) {
        suitMeld = otherMeld;
      }
    }

    let rankMeld = cards.filter((card) => card.rank == targetCard.rank);

    if(rankMeld.length > suitMeld.length) { // Prefer Suit Meld over a Rank Meld
      return rankMeld;
    } else {
      return suitMeld;
    }

  }

  /**
   * Appends a Meld with Given Card
   * @param {Card} targetCard - The card to be melded
   * @returns {Object} The index of the meld and the new meld itself
   */
  _create_similar_meld(targetCard) {

    let index = targetCard.value;

    for(let i = 0; i < this.melds.length; i++) {

      let meld = this.melds[i].slice(0);

      if(meld[0].rank != meld[meld.length - 1].rank){ // Suit Meld

        if(meld[0].suit == targetCard.suit) {

          let firstRankIndex = meld[0].value,
              lastRankIndex = meld[meld.length - 1].value;

          if(firstRankIndex - 1 == index) { // Add to front
            meld.unshift(targetCard);
            return {index: i, meld: meld};
          } else if(lastRankIndex + 1 == index) { // Add to back
            meld.push(targetCard);
            return {index: i, meld: meld};
          }

        }

      } else if(meld[0].rank == targetCard.rank) { // Rank Meld

        meld.push(targetCard);
        this._sortDeck(meld);
        return {index: i, meld: meld};

      }

    }

    if(targetCard.value == 0) { // If it's an Ace try flipping its value
      targetCard.value = 14;
      return this._create_similar_meld(targetCard)
    }

    return {index: -1};

  }

  /**
   * Generates a Deck of Cards
   */
  _genCards() {

    this.cardRanks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    let cards = [];

    for (let suit of ['spade', 'heart', 'diamond', 'club']) {

      for (let i = 2; i <= 10; i++) {
        cards.push({
          html: `.card._${i}.${suit}`,
          suit: suit,
          rank: "" + i,
          value: this.cardRanks.indexOf("" + i)
        });
      }

      for (let face of ['A', 'J', 'Q', 'K']) {
        cards.push({
          html: `.card._${face}.${suit}`,
          suit: suit,
          rank: face,
          value: this.cardRanks.indexOf(face)
        });
      }

    }

    for (let i = cards.length - 1; i > 0; i--) { // Shuffle Cards
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

  /**
   * Plays a Turn as the CPU
   */
  _play_cpu_turn() {

    let cpuCards = this.playerCards[1];

    setTimeout(() => { // Choose a card

      let drawFromDeck = Math.random() > .5 || this.draw.length == 0; // Randomly picks where to draw from
      let data = {cmd: 'click', button: 'left'};

      if(drawFromDeck) {
        data.card = 'deck';
      } else {
        let card = this.draw[this.draw.length - 1];
        data.card = 'notdeck';
        data.rank = card.rank;
        data.suit = card.suit;
      }

      this._process_choose_phase(1, data);

    }, 600);

    setTimeout(() => { // Meld cards

      for(let card of cpuCards) {  // Attempts to meld every card it has
        this._process_meld(1, card);
      }

    }, 1800);

    setTimeout(() => { // Discard a card

      let discardCard = cpuCards[Math.floor(Math.random() * cpuCards.length)]; // Discard random card
      this._process_discard(1, discardCard);
      this._check_win();

    }, 2200);

  }

}
