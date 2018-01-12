let params = window.location.href.split("/");
let code = params[4], token = params[5];

let hand = [];

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

socketHandlers.join = (data) => {
  for(let card of data.cards) {
    $("#cards").append(`<div class="card _${card.rank} ${card.suit}"></div>`);
    hand.push(card);
  }
  renderHand();
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

let renderHand = () => {
  let i = 0;
  for(let card of hand) {
    setCardPos(card, $(window).width() / 4 + i * 10, (i % 13) * 20, i + 2, i * 5);
    i += 1;
  }
}
