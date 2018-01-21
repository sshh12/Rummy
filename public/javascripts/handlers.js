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
  renderHand(ophand, flip=true);
  renderDeck(deck, left=true);
  renderDeck(draw);
  renderMelds(melds);

  setGlow($('.ophand'), 15, '#fa001e');
  setGlow($('.myhand'), 15, '#005bf9');

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

  setGlow($('.ophand'), 15, '#fa001e');
  setGlow($('.myhand'), 15, '#005bf9');

}

handle.discard = (data) => {

  if (data.player == 'me') {
    hand.splice(hand.indexOf(getCard(hand, data.card)), 1);
    $(data.card.html).attr('class', `card _${data.card.rank} ${data.card.suit}`);
    draw.push(data.card);
    renderHand(hand);
    renderDeck(draw);
  } else {
    let nextCard = ophand.pop();
    $(nextCard.html).attr('class', `card _${data.card.rank} ${data.card.suit}`);
    draw.push(data.card);
    renderHand(ophand, flip=true);
    renderDeck(draw);
  }

  setGlow($('.ophand'), 15, '#fa001e');
  setGlow($('.myhand'), 15, '#005bf9');

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

handle.win = (data) => {
  $('#alert').attr('class', 'alert alert-success');
  $('#alert').html('<h4 class="alert-heading">You Won!</h4><p>Refresh the page to join a new lobby.</p>');
  $('#alert').fadeToggle();
  $('.card').unbind('click');
  showConfetti();
}

handle.loss = (data) => {
  $('#alert').attr('class', 'alert alert-danger');
  $('#alert').html('<h4 class="alert-heading">You Lost!</h4><p>Refresh the page to join a new lobby.</p>');
  $('#alert').fadeToggle();
  $('.card').unbind('click');
}
