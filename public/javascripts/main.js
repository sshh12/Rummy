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

let beginLeave = () => {

  window.secs = 10;

  setInterval(() => {
    if(window.secs == 0) {
      window.location.href = "/";
    }
    $('#exitmsg').html(`Exiting match in ${window.secs--}s...`);
  }, 1000);

}

$(window).on('resize', () => {
  renderHand(hand);
  renderHand(ophand, flip=true);
  renderDeck(deck, left=true);
  renderDeck(draw);
  renderMelds(melds);
})
