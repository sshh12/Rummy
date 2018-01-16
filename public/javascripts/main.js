let params = window.location.href.split("/");
let code = params[4], token = params[5];

let hand = [],
    ophand = [],
    deck = [],
    draw = [],
    groups = [];

let sendData = (data) => {
  data.lobby = code;
  data.token = token;
  send(data);
}

socketHandlers.connected = (data) => {
  sendData({cmd: 'join'});
}

socketHandlers.exit = (data) => {
  window.location.href = "/";
}

socketHandlers.cards = (data) => {

  for(let card of data.cards) {
    $("#cards").append(`<div class="card _${card.rank} ${card.suit}"></div>`);
    hand.push(card);
  }

  for(let card of data.draw) {
    $("#cards").append(`<div class="card _${card.rank} ${card.suit}"></div>`);
    draw.push(card);
  }

  for(let group of data.groups) {
    for(let card of group) {
      $("#cards").append(`<div class="card _${card.rank} ${card.suit}"></div>`);
    }
    groups.push(group);
  }

  ophand = createFakeCards('ophand', data.opcards);
  deck = createFakeCards('deck', data.deck);

  renderHand(hand);
  renderHand(ophand, flip=true);
  renderDeck(deck, left=true);
  renderDeck(draw);
  renderGroups(groups);

}

let createFakeCards = (name, n) => {
  let cards = [];
  for(let i = 0; i < n; i++) {
    $("#cards").append(`<div class="card ${name} fake_${i} unknown"></div>`);
    cards.push({html: `.card.fake_${i}.${name}`, suit: 'none', rank: 'none'});
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

let renderHand = (handCards, flip = false) => {

  let height = flip ? 20: $(window).height() - 250;
  let dangle = flip ? 4: -4;

  let i = 1,
      leftIndex = -1,
      rightIndex = -1,
      half = Math.floor(handCards.length / 2),
      offset = ($(window).width() / 2) - (20 * handCards.length / 2) - 70;

  if(handCards.length % 2 == 1) {
    leftIndex = half - 1;
    rightIndex = half + 1;
    setCardPos(handCards[half], $(window).width() / 2 - 70, height, half, 0);
  } else {
    leftIndex = half - 1;
    rightIndex = half;
  }

  while(leftIndex >= 0) {
    setCardPos(handCards[leftIndex], offset + leftIndex * 20, height, leftIndex, i * dangle);
    setCardPos(handCards[rightIndex], offset + rightIndex * 20, height, rightIndex, i * -dangle);
    leftIndex--; rightIndex++; i++;
  }

}

let renderDeck = (cards, left = false) => {

  let offset = left ? $(window).width() / 2 - 200 : $(window).width() / 2 + 40;

  for(let i in cards) {
    setCardPos(cards[i], offset, $(window).height() / 2 - 99, i + 2, 0);
  }

}

let renderGroups = (groups) => {

  let height = 10, offset = 10;

  for(let i in groups) {

    for(let j in groups[i]) {
      setCardPos(groups[i][j], offset + j * 20, height, i + 2, 0);
    }

    height += 220;
    if(height + 200 > $(window).height()) {
      height = 10;
      offset += 200;
    }

  }

}

$(window).on('resize', () => {
  renderHand(hand);
  renderHand(ophand, flip=true);
  renderDeck(deck, left=true);
  renderDeck(draw);
  renderGroups(groups);
})
