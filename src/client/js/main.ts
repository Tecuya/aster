let sun = new Image();
let moon = new Image();
let earth = new Image();


function init() {
  let canvasEl = <HTMLCanvasElement>document.getElementById('main');
  canvasEl.width = window.innerWidth - 20;
  canvasEl.height = window.innerHeight - 20;

  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);

  draw();

  // sun.src = 'https://mdn.mozillademos.org/files/1456/Canvas_sun.png';
  // moon.src = 'https://mdn.mozillademos.org/files/1443/Canvas_moon.png';
  // earth.src = 'https://mdn.mozillademos.org/files/1429/Canvas_earth.png';

}

var leftPressed: boolean;
var rightPressed: boolean;
var upPressed: boolean;

let currentRotation = 0;

function keyDownHandler(e:KeyboardEvent) {
  if(e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = true;
  }
  else if(e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = true;
  } else if(e.key == "Up" || e.key == "ArrowUp") {
    upPressed = true;
  }
}

function keyUpHandler(e:KeyboardEvent) {
  if(e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = false;
  }
  else if(e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = false;
  } else if(e.key == "Up" || e.key == "ArrowUp") {
    upPressed = false;
  }
}


function drawPlayer(ctx:CanvasRenderingContext2D, x:number, y:number, rotation:number) {

  ctx.font = '30px Arial';
  ctx.fillText(`x: ${x} y:${y} r:${rotation}`, 1000, 1000);
  
  ctx.lineWidth = 3;

  ctx.translate(x, y);
  ctx.rotate(rotation);
  
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-10, 10);
  ctx.lineTo(10, 10);
  ctx.closePath();
  ctx.stroke();
  ctx.closePath();

  ctx.restore();
}

function draw() {
  let canvas = <HTMLCanvasElement>document.getElementById('main');
  let ctx = canvas.getContext('2d');

  if(ctx == null) {
    return;
  }

  if(leftPressed) {
    currentRotation -= 0.1;
  }
  if(rightPressed) {
    currentRotation += 0.1;
  }
  
//  ctx.globalCompositeOperation = 'destination-over';
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas

  ctx.fillStyle = 'rgba(0, 0, 0, 1)';
  ctx.save();
  
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'green';
  ctx.fillStyle = 'green';;  
  drawPlayer(ctx, 40, 40, currentRotation);
  
  // ctx.translate(150, 150);

  // // Earth
  // var time = new Date();
  // ctx.rotate(((2 * Math.PI) / 60) * time.getSeconds() + ((2 * Math.PI) / 60000) * time.getMilliseconds());
  // ctx.translate(105, 0);
  // ctx.fillRect(0, -12, 40, 24); // Shadow
  // ctx.drawImage(earth, -12, -12);

  // // Moon
  // ctx.save();
  // ctx.rotate(((2 * Math.PI) / 6) * time.getSeconds() + ((2 * Math.PI) / 6000) * time.getMilliseconds());
  // ctx.translate(0, 28.5);
  // ctx.drawImage(moon, -3.5, -3.5);

  ctx.restore();
  window.requestAnimationFrame(draw);
 
  // ctx.beginPath();
  // ctx.arc(150, 150, 105, 0, Math.PI * 2, false); // Earth orbit
  // ctx.stroke();

  // ctx.drawImage(sun, 0, 0, 300, 300);

 // if(ctx != null) {
  //   ctx.fillStyle = 'rgb(200, 0, 0)';
  //   ctx.fillRect(10, 10, 50, 50);
  // }
}
