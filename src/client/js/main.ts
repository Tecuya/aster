
var canvas: HTMLCanvasElement;

var leftPressed: boolean;
var rightPressed: boolean;
var upPressed: boolean;
var spacePressed: boolean;

var player: Player;
let bullets: Bullet[] = [];
let asteroids: Asteroid[] = [];

function init() {
  canvas = <HTMLCanvasElement>document.getElementById('main');
  canvas.width = window.innerWidth - 20;
  canvas.height = window.innerHeight - 20;

  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);

  player = new Player(canvas.width / 2, canvas.height / 2, 0, 0);
  
  asteroids.push(
    new Asteroid(200, 200, 10, 10));
  
  frame();
}

function keyDownHandler(e:KeyboardEvent) {
  if(e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = true;
  }
  else if(e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = true;
  } else if(e.key == "Up" || e.key == "ArrowUp") {
    upPressed = true;
  } else if(e.key == " ") {
      bullets.push(
        new Bullet(
          player.positionX,
          player.positionY,
          player.velocityX + (Math.sin(player.currentRotation) * 10),
          player.velocityY + (-1 * Math.cos(player.currentRotation) * 10)));    
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

abstract class Entity {
  constructor(
    public positionX:number,
    public positionY:number,
    public velocityX:number,
    public velocityY:number) {}

  updatePosition(): void {
    this.positionX += this.velocityX;
    this.positionY += this.velocityY;
  }

  wrapPosition(): void { 
    if(this.positionX > canvas.width) {
      this.positionX = 0;
    } else if(this.positionX < 0) {
      this.positionX = canvas.width;
    }
    
    if(this.positionY > canvas.height) {
      this.positionY = 0;
    } else if(this.positionY < 0) {
      this.positionY = canvas.height;
    }
  }
  
  abstract draw(ctx:CanvasRenderingContext2D): void;
}

class Asteroid extends Entity {

  updatePosition(): void {
    super.updatePosition();
    this.wrapPosition();
  }
  
  draw(ctx:CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    
    ctx.beginPath();
    ctx.translate(this.positionX, this.positionY);
    ctx.moveTo(0, 10);
    ctx.lineTo(7, 5);
    ctx.lineTo(5, 0);
    ctx.lineTo(7, -3);
    ctx.lineTo(2, -10);
    ctx.lineTo(-3, -9);
    ctx.lineTo(-4, -2);
    ctx.lineTo(-7, 2);
    ctx.lineTo(-6, 9);
    ctx.closePath();
    ctx.stroke();
    
    ctx.restore();
  }

}

class Bullet extends Entity {
  
  draw(ctx:CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    
    ctx.beginPath();
    ctx.moveTo(this.positionX, this.positionY);
    ctx.lineTo(this.positionX + this.velocityX, this.positionY + this.velocityY);
    ctx.closePath();
    ctx.stroke();
    
    ctx.restore();
  }

  // findCollisions(Asteroid[]:asteroids): Asteroid[] {
    
  // }
}

class Player extends Entity {

  let currentRotation = 0;
  
  updatePosition(): void {
    super.updatePosition();
    this.wrapPosition();
  }
    
  draw(ctx:CanvasRenderingContext2D): void {
    this.draw(ctx, false);
  }

  draw(ctx:CanvasRenderingContext2D, thrust:boolean): void {
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;

    ctx.translate(x, y);
    ctx.rotate(rotation);
    
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(-10, 10);
    ctx.lineTo(0, 7);

    if(thrust) {
      ctx.lineTo(-4, 14);
      ctx.lineTo(0, 18);
      ctx.lineTo(4, 14);
      ctx.lineTo(0, 7);
    }
    
    ctx.lineTo(10, 10);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }
}

function frame() {
  let ctx = canvas.getContext('2d');

  if(ctx == null) {
    return;
  }

  /////////
  // update state
  
  if(leftPressed) {
    player.currentRotation -= 0.09;
  }
  if(rightPressed) {
    player.currentRotation += 0.09;
  }
  if(upPressed) {
    player.velocityX += (Math.sin(player.currentRotation) / 5);
    player.velocityY -= (Math.cos(player.currentRotation) / 5);
  }

  player.updatePosition();

  for(let bullet of bullets) {
    bullet.updatePosition();
  }

  for(let asteroid of asteroids) {
    asteroid.updatePosition();
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

  player.draw(ctx, upPressed);

  for(let bullet of bullets) {
    bullet.draw(ctx);
  }

  for(let asteroid of asteroids) {
    ateroid.draw(ctx);
  }
  
  window.requestAnimationFrame(frame); 
}
