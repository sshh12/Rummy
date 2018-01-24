/*
 * This Creates a Snow/Confetti Animation
 */

let confettiContext = $('#confetti').get(0).getContext('2d');
let confettiDimensions = {};

let setConfettiCanvasSize = () => {
  confettiDimensions = {width: $(window).width(), height: $(window).height()};
  $('#confetti').width(confettiDimensions.width);
  $('#confetti').height(confettiDimensions.height);
};
setConfettiCanvasSize();

$(window).on('resize', setConfettiCanvasSize);

let numConfetti = 2000,
    confetti = [];

class Confetti {

  constructor() { // Create piece of confetti w/random properties
    this.setPos();
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

  setPos() {
    this.x = Math.random() * confettiDimensions.width;
    this.y = Math.random() * confettiDimensions.height;
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
    if(this.x > confettiDimensions.width) {
      this.setPos();
    } else if(this.x < 0) {
      this.setPos();
    }
    if(this.y > confettiDimensions.height) {
      this.y = 0;
    }
  }

}

let showConfetti = () => { // Displays confetti and starts animation

  $('#confetti').show();

  for(let i = 0; i < numConfetti; i++) {
    confetti.push(new Confetti());
  }

  requestAnimationFrame(renderConfetti);

}

let renderConfetti = () => { // Draws confetti

  confettiContext.clearRect(0, 0, confettiDimensions.width, confettiDimensions.height);

  for(let conf of confetti) {
    conf.draw();
  }

  requestAnimationFrame(renderConfetti);

}
