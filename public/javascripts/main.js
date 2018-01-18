let params = window.location.href.split("/");
let code = params[4],
    token = params[5];

let hand = [],
    ophand = [],
    deck = [],
    draw = [],
    melds = [];

let sendData = (data) => {
  data.lobby = code;
  data.token = token;
  send(data);
}

let setClickHandle = () => {

  let sendClick = (name, left = true) => {

    if (name.includes('unknown')) {

      if (name.includes('deck')) {
        sendData({
          cmd: 'click',
          button: left ? 'left' : 'right',
          card: 'deck'
        });
      }

    } else {

      [_, rank, suit] = name.split(' ');
      sendData({
        cmd: 'click',
        button: left ? 'left' : 'right',
        card: 'hand',
        rank: rank.replace('_', ''),
        suit: suit
      });

    }

  }

  $('.card').on('click', function() {
    sendClick(this.className, left=true);
  });

  $('.card').on('contextmenu', function() {
    sendClick(this.className, left=false);
    return false;
  })

  $('body').on('contextmenu', function() {
    return false;
  })

}

let getCard = (collection, targetCard) => {
  for (let card of collection) {
    if (card.suit == targetCard.suit && card.rank == targetCard.rank) {
      return card;
    }
  }
  return null;;
}

let cardRanks = ['A', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let sortDeck = (cards) => {
  cards.sort((a, b) => {
    if (a.rank != b.rank) {
       return cardRanks.indexOf(a.rank) - cardRanks.indexOf(b.rank);
    } else {
       return a.suit - b.suit;
    }
  });
}

handle.connected = (data) => {
  sendData({
    cmd: 'join'
  });
}

handle.exit = (data) => {
  window.location.href = "/";
}

handle.cards = (data) => {

  for (let card of data.cards) {
    $("#cards").append(`<div class="card _${card.rank} ${card.suit} myhand"></div>`);
    hand.push(card);
  }

  for (let card of data.draw) {
    $("#cards").append(`<div class="card _${card.rank} ${card.suit}"></div>`);
    draw.push(card);
  }

  for (let meld of data.melds) {
    for (let card of meld) {
      $("#cards").append(`<div class="card _${card.rank} ${card.suit}"></div>`);
    }
    melds.push(meld);
  }

  ophand = createFakeCards('ophand', data.opcards);
  deck = createFakeCards('deck', data.deck);

  renderHand(hand);
  renderHand(ophand, flip = true);
  renderDeck(deck, left = true);
  renderDeck(draw);
  renderMelds(melds);

  setClickHandle();

}

handle.draw = (data) => {

  let nextCard = {};

  if (data.from == 'deck') {
    nextCard = deck.pop();
  } else {
    nextCard = draw.pop();
  }

  if (data.player == 'me') {
    $(nextCard.html).attr('class', `card _${data.card.rank} ${data.card.suit} myhand`);
    hand.push(data.card);
    renderHand(hand);
  } else {
    $(nextCard.html).attr('class', `card ophand fake_${ophand.length} unknown`);
    ophand.push({
      html: `.card.fake_${ophand.length}.ophand`,
      suit: 'none',
      rank: 'none'
    });
    renderHand(ophand, flip=true);
  }

}

handle.discard = (data) => {

  if (data.player == 'me') {
    hand.splice(hand.indexOf(getCard(hand, data.card)), 1);
    draw.push(data.card);
    renderHand(hand);
    renderDeck(draw);
    setGlow($('.ophand'), 15, '#fa001e');
  } else {
    let nextCard = ophand.pop();
    $(nextCard.html).attr('class', `card _${data.card.rank} ${data.card.suit}`);
    draw.push(data.card);
    renderHand(ophand, flip=true);
    renderDeck(draw);
    setGlow($('.myhand'), 15, '#005bf9');
  }

}

handle.newmeld = (data) => {

  if (data.player == 'me') {
    for(let card of data.meld) {
      hand.splice(hand.indexOf(getCard(hand, card)), 1);
    }
    melds.push(data.meld);
    renderHand(hand);
    renderMelds(melds);
  } else {
    for(let card of data.meld) {
      let nextCard = ophand.pop();
      $(nextCard.html).attr('class', `card _${card.rank} ${card.suit}`);
    }
    melds.push(data.meld);
    renderHand(ophand, flip=true);
    renderMelds(melds);
  }

}

handle.addmeld = (data) => {

  if (data.player == 'me') {
    hand.splice(hand.indexOf(getCard(hand, data.card)), 1);
    melds[data.index] = data.meld;
    renderHand(hand);
    renderMelds(melds);
  } else {
    let nextCard = ophand.pop();
    $(nextCard.html).attr('class', `card _${data.card.rank} ${data.card.suit}`);
    melds[data.index] = data.meld;
    renderHand(ophand, flip=true);
    renderMelds(melds);
  }

}

let createFakeCards = (name, n) => {
  let cards = [];
  for (let i = 0; i < n; i++) {
    $("#cards").append(`<div class="card ${name} fake_${i} unknown"></div>`);
    cards.push({
      html: `.card.fake_${i}.${name}`,
      suit: 'none',
      rank: 'none'
    });
  }
  return cards;
}

let setCardPos = (card, x, y, z = 2, degs = 0) => {
  $(card.html).css({
    'transform': `translateX(${x}px) translateY(${y}px) rotateZ(${degs}deg)`,
    'MozTransform': `translateX(${x}px) translateY(${y}px) rotateZ(${degs}deg)`,
    'WebkitTransform': `translateX(${x}px) translateY(${y}px) rotateZ(${degs}deg)`,
    'msTransform': `translateX(${x}px) translateY(${y}px) rotateZ(${degs}deg)`,
    'z-index': z
  });
}

let setGlow = (selector, amt, color) => {
  selector.css({
    '-moz-box-shadow': `0 0 ${amt}px ${color}`,
    '-webkit-box-shadow': `0 0 ${amt}px ${color}`,
    'box-shadow': `0px 0px ${amt}px ${color}`
  });
}

let renderHand = (handCards, flip = false) => {

  if(!flip) { sortDeck(handCards) };

  let height = flip ? 20 : $(window).height() - 250;
  let dangle = flip ? 4 : -4;

  let i = 1,
      leftIndex = -1,
      rightIndex = -1,
      half = Math.floor(handCards.length / 2),
      offset = ($(window).width() / 2) - (20 * handCards.length / 2) - 70;

  if (handCards.length % 2 == 1) {
    leftIndex = half - 1;
    rightIndex = half + 1;
    setCardPos(handCards[half], $(window).width() / 2 - 75, height, half + 100, 0);
  } else {
    leftIndex = half - 1;
    rightIndex = half;
  }

  while (leftIndex >= 0) {
    setCardPos(handCards[leftIndex], offset + leftIndex * 20, height, leftIndex + 100, i * dangle);
    setCardPos(handCards[rightIndex], offset + rightIndex * 20, height, rightIndex + 100, i * -dangle);
    leftIndex--;
    rightIndex++;
    i++;
  }

}

let renderDeck = (cards, left = false) => {

  let offset = left ? $(window).width() / 2 - 200 : $(window).width() / 2 + 40;

  for (let i in cards) {
    setCardPos(cards[i], offset, $(window).height() / 2 - 99, i + 2, 0);
  }

}

let renderMelds = (melds) => {

  let height = 10,
      offset = 10;

  for (let i in melds) {

    for (let j in melds[i]) {
      setCardPos(melds[i][j], offset + j * 20, height, i + j + 1000, 0);
    }

    height += 220;
    if (height + 200 > $(window).height()) {
      height = 10;
      offset += 240;
    }

  }

}

$(window).on('resize', () => {
  renderHand(hand);
  renderHand(ophand, flip=true);
  renderDeck(deck, left=true);
  renderDeck(draw);
  renderMelds(melds);
})
