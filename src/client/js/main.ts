

function init() {
  let canvasEl = <HTMLCanvasElement>document.getElementById('main');
  canvasEl.width = window.innerWidth - 20;
  canvasEl.height = window.innerHeight - 20;

  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);

  draw();

}

var leftPressed: boolean;
var rightPressed: boolean;
var upPressed: boolean;
var spacePressed: boolean;

let bullets: Bullet[] = [];
let currentRotation = 0;
let velocityX = 0;
let velocityY = 0;
let playerX = 40;
let playerY = 40;
let radian = 57.2958;

function keyDownHandler(e:KeyboardEvent) {
  if(e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = true;
  }
  else if(e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = true;
  } else if(e.key == "Up" || e.key == "ArrowUp") {
    upPressed = true;
  } else if(e.key == " ") {
    spacePressed = true;
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
  } else if(e.key == " ") {
    spacePressed = false;
  }
}


function drawPlayer(ctx:CanvasRenderingContext2D, x:number, y:number, rotation:number) {
  
  // ctx.font = '30px Arial';
  // ctx.fillText(`x: ${x} y:${y} r:${rotation}`, 200, 200);

  ctx.save();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 3;

  ctx.translate(x, y);
  ctx.rotate(rotation);
  
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-10, 10);
  ctx.lineTo(0, 7);
  ctx.lineTo(10, 10);
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
}

class Bullet {
  constructor(
    private positionX:number,
    private positionY:number,
    private velocityX:number,
    private velocityY:number) {}

  updatePosition(): boolean {
    this.positionX += this.velocityX;
    this.positionY += this.velocityY;
  }
  
  draw(ctx:CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.moveTo(this.positionX, this.positionY);
    ctx.lineTo(this.positionX + this.velocityX, this.positionY + this.velocityY);
    ctx.closePath();
    ctx.stroke();
    
    ctx.restore();
  }
}

function draw() {
  let canvas = <HTMLCanvasElement>document.getElementById('main');
  let ctx = canvas.getContext('2d');

  if(ctx == null) {
    return;
  }


  /////////
  // update state
  
  if(leftPressed) {
    currentRotation -= 0.09;
  }
  if(rightPressed) {
    currentRotation += 0.09;
  }
  if(upPressed) {
    velocityX += (Math.sin(currentRotation) / 5);
    velocityY -= (Math.cos(currentRotation) / 5);
  }
  
  playerX += velocityX;
  playerY += velocityY;

  if(playerX > canvas.width) {
    playerX = 0;
  } else if(playerX < 0) {
    playerX = canvas.width;
  }

  if(playerY > canvas.height) {
    playerY = 0;
  } else if(playerY < 0) {
    playerY = canvas.height;
  }

  if(spacePressed) {
    if(bullets.length == 0) {
      bullets.push(
        new Bullet(
          playerX,
          playerY,
          velocityX + (Math.sin(currentRotation) * 5),
          velocityY + (-1 * Math.cos(currentRotation) * 5)));
    }
  }

  for(let bullet of bullets) {
    bullet.updatePosition();
  }
  
  // remove bullets that hit the edge
  bullets = bullets.filter(
    bullet =>
      bullet.positionX < canvas.width &&
      bullet.positionX > 0 &&
      bullet.positionY < canvas.height &&
      bullet.positionY > 0
  );
  
  ///////////
  // draw
  
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas
  ctx.fillStyle = 'black';  
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  drawPlayer(ctx, playerX, playerY, currentRotation);

  for(let bullet of bullets) {
    bullet.draw(ctx);
  }
    
  window.requestAnimationFrame(draw); 
}
