/*
 * The Main Script for Rummy Front-End
 */

let params = window.location.href.split("/"); // Extract Code and Token from URL
let code = params[4],
    token = params[5];

// Local Game Objects
// Note: The server verifies their integrity to prevent Front-End tampering/cheating
let hand = [],
    ophand = [],
    deck = [],
    draw = [],
    melds = [];

let sendData = (data) => { // Sends data with token attached
  data.lobby = code;
  data.token = token;
  send(data);
}

let setClickHandle = () => { // Set the onClick handler for all cards

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
        card: 'notdeck',
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

  $('body').on('contextmenu', function() { // Prevent accedental right click
    return false;
  })

}

let getCard = (collection, targetCard) => { // Find Card
  for (let card of collection) {
    if (card.suit == targetCard.suit && card.rank == targetCard.rank) {
      return card;
    }
  }
  return null;
}

let createFakeCards = (name, n) => { // Creates fake cards (to mask true identity until played/drawn)
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

let sortDeck = (cards) => { // In-place sorts cards
  cards.sort((a, b) => {
    if (a.rank != b.rank) {
       return a.rank - b.rank;
    } else {
       return a.suit - b.suit;
    }
  });
}

let beginLeave = () => { // Start a countdown to automatically leave

  window.secs = 60;

  setInterval(() => {
    if(window.secs == 0) {
      window.location.href = "/";
    }
    $('#exitmsg').html(`Exiting match in ${window.secs--}s...`);
  }, 1000);

}

$(window).on('resize', () => { // Re-render all elements when the window size changes
  renderHand(hand);
  renderHand(ophand, flip=true);
  renderDeck(deck, left=true);
  renderDeck(draw);
  renderMelds(melds);
  renderHint();
})
