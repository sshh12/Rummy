
let confettiContext = $('#confetti').get(0).getContext('2d');

let setConfettiCanvasSize = () => {
  $('#confetti').width($(window).width());
  $('#confetti').height($(window).height());
};
setConfettiCanvasSize();

$(window).on('resize', setConfettiCanvasSize);

let numConfetti = 2000,
    confetti = [];

class Confetti {

  constructor() {
    this.x = Math.random() * $(window).width();
    this.y = Math.random() * $(window).height();
    this.vx = Math.random() * 1.2 - .6;
    this.vy = Math.random() * 1 + 1;
    this.r = Math.random() * 2 + .1
    this.color = {
      r: Math.random() * 70 + 120,
      g: Math.random() * 70 + 120,
      b: Math.random() * 70 + 120,
      a: Math.random() * .5 + .5
    }
  }

  draw() {
    confettiContext.beginPath();
		confettiContext.fillStyle = `rgba(${~~this.color.r}, ${~~this.color.g}, ${~~this.color.b}, ${this.color.a})`;
		confettiContext.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
		confettiContext.fill();
    this.update();
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if(this.x > $(window).width()) {
      this.x = 0;
    } else if(this.x < 0) {
      this.x = $(window).width();
    }
    if(this.y > $(window).height()) {
      this.y = 0;
    }
  }

}

let showConfetti = () => {

  for(let i = 0; i < numConfetti; i++) {
    confetti.push(new Confetti());
  }

  requestAnimationFrame(renderConfetti);

}

let renderConfetti = () => {

  confettiContext.clearRect(0, 0, $(window).width(), $(window).height());

  for(let conf of confetti) {
    conf.draw();
  }

  requestAnimationFrame(renderConfetti);
}
