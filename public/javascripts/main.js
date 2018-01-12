let setCardPos = (card, x, y, z = 2, degs = 0) => {
  card.elem.css({
     'transform': `translateX(${x}px) translateY(${y}px) rotateZ(${degs}deg)`,
     'MozTransform': `translateX(${x}px) translateY(${y}px) rotateZ(${degs}deg)`,
     'WebkitTransform': `translateX(${x}px) translateY(${y}px) rotateZ(${degs}deg)`,
     'msTransform': `translateX(${x}px) translateY(${y}px) rotateZ(${degs}deg)`,
     'z-index': z
  });
}

let cards = [];

for(let suit of ['spade', 'heart', 'diamond', 'club']) {

  for(let i = 2; i <= 10; i++){
    $("#cards").append(`<div class="card _${i} ${suit}"></div>`);
    cards.push({elem: $(`.card._${i}.${suit}`)});
  }

  for(let face of ['A', 'J', 'Q', 'K']){
    $("#cards").append(`<div class="card _${face} ${suit}"></div>`);
    cards.push({elem: $(`.card._${face}.${suit}`)});
  }

}

setTimeout(() => {
  let i = 0;
  for(let card of cards) {
    setCardPos(card, i * 20, (i % 13) * 20, i + 2);
    i += 1;
  }
}, 1000);
