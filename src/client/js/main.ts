
declare var greinerHormann: any;

var canvas: HTMLCanvasElement;

var leftPressed: boolean;
var rightPressed: boolean;
var upPressed: boolean;
var spacePressed: boolean;

var player: Player;
let bullets: Bullet[] = [];
let asteroids: Asteroid[] = [];

let canvasX = 1920;
let canvasY = 1080;

let bulletSize = 6;

function init() {
  canvas = <HTMLCanvasElement>document.getElementById('main');
  canvas.width = canvasX;
  canvas.height = canvasY;

  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);

  player = new Player(canvas.width / 2, canvas.height / 2, 0, 0, 0);

  for(let x of [0,1,2,3,4,5]) { 
    asteroids.push(
      new AsteroidLarge(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 2,
        Math.random() * 2));
  }
  
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


class Entity {
  
  protected distanceTraveled: number;
  
  constructor(
    public positionX:number,
    public positionY:number,
    public velocityX:number,
    public velocityY:number) {

    this.distanceTraveled = 0;
  }

  updatePosition(): void {
    this.positionX += this.velocityX;
    this.positionY += this.velocityY;
    this.distanceTraveled += Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2);
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
  
}

abstract class Asteroid extends Entity {

  updatePosition(): void {
    super.updatePosition();
    this.wrapPosition();
  }

  draw(ctx:CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.translate(this.positionX, this.positionY);

    this.getCoordinates().forEach((coord, idx) => {
      if(idx == 0) {
        ctx.moveTo(coord[0], coord[1]);
      } else {
        ctx.lineTo(coord[0], coord[1]);
      }      
    });
    
    ctx.closePath();
    ctx.stroke();
    
    ctx.restore();
  }

  abstract getCoordinates(): number[][];
  abstract getSize(): string;

  getAbsoluteCoordinates(): number[][] {
    
    var absoluteCoords: number[][];
    absoluteCoords = [];
    
    for(let coord of this.getCoordinates()) {
      absoluteCoords.push(
        [this.positionX + coord[0],
         this.positionY + coord[1]]);
    }

    return absoluteCoords;
  }
}

class AsteroidLarge extends Asteroid {
  getCoordinates(): number[][] {
    return [
      [0, 80],
      [56, 40],
      [40, 0],
      [56, -24],
      [16, -80],
      [-24, -72],
      [-32, -16],
      [-56, 16],
      [-48, 72],

      [0, 80]
      
    ];    
  }
  
  getSize(): string {
    return 'large';
  }
}

class AsteroidMedium extends Asteroid {
  getCoordinates(): number[][] {
    return [
      [0, 40],
      [28, 20],
      [20, 0],
      [28, -12],
      [8, -40],
      [-12, -36],
      [-16, -8],
      [-28, 8],
      [-24, 36],
      
      [0, 40]
    ];    
  }
  
  getSize(): string {
    return 'medium';
  }
}

class AsteroidSmall extends Asteroid {
  getCoordinates(): number[][] {
    return [
      [0, 20],
      [14, 10],
      [10, 0],
      [14, -6],
      [4, -20],
      [-6, -18],
      [-8, -4],
      [-14, 4],
      [-12, 18],
      
      [0, 20]
    ];    
  }

  getSize(): string {
    return 'small';
  }
  
}

class Bullet extends Entity {

  updatePosition(): void {
    super.updatePosition();
    this.wrapPosition();
  }
  
  draw(ctx:CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = bulletSize;
    
    ctx.beginPath();
    ctx.moveTo(this.positionX, this.positionY);
    ctx.lineTo(this.positionX + this.velocityX, this.positionY + this.velocityY);
    ctx.closePath();
    ctx.stroke();
    
    ctx.restore();
  }

  shouldContinue(): boolean {
    return (this.distanceTraveled < canvas.width);
  }

  getAbsoluteCoordinates(): number[][] {
    return [
      [this.positionX - bulletSize / 2, this.positionY - bulletSize / 2],
      [this.positionX + bulletSize / 2, this.positionY - bulletSize / 2],
      [this.positionX + bulletSize / 2, this.positionY + bulletSize / 2],
      [this.positionX - bulletSize / 2, this.positionY + bulletSize / 2],
      [this.positionX - bulletSize / 2, this.positionY - bulletSize / 2]
    ];
  }
}

class Player extends Entity {
  
  constructor(
    public positionX:number,
    public positionY:number,
    public velocityX:number,
    public velocityY:number,
    public currentRotation:number) {
    
    super(positionX, positionY, velocityX, velocityY);
  }
    
  updatePosition(): void {
    super.updatePosition();
    this.wrapPosition();
  }    

  draw(ctx:CanvasRenderingContext2D, thrust:boolean): void {
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;

    ctx.translate(this.positionX, this.positionY);
    ctx.rotate(this.currentRotation);
    
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

  handleKeys(leftPressed:boolean, rightPressed:boolean, upPressed:boolean) {
    if(leftPressed) {
      this.currentRotation -= 0.09;
    }
    if(rightPressed) {
      this.currentRotation += 0.09;
    }
    if(upPressed) {
      this.velocityX += (Math.sin(this.currentRotation) / 5);
      this.velocityY -= (Math.cos(this.currentRotation) / 5);
    }
  }
}

function frame() {
  let ctx = canvas.getContext('2d');

  if(ctx == null) {
    return;
  }

  /////////
  // update state

  player.handleKeys(leftPressed, rightPressed, upPressed);
  
  player.updatePosition();
  for(let bullet of bullets) bullet.updatePosition();
  for(let asteroid of asteroids) asteroid.updatePosition();

  bullets = bullets.filter(bullet => bullet.shouldContinue());

  bullets.forEach((bullet, bidx) => {
    asteroids.forEach((asteroid, aidx) => {
      
      if(greinerHormann.intersection(asteroid.getAbsoluteCoordinates(), bullet.getAbsoluteCoordinates())) { 

        delete bullets[bidx];
        delete asteroids[aidx];

        let size = asteroid.getSize();
        if(size == 'large') {
          asteroids.push(
            new AsteroidMedium(
              asteroid.positionX,
              asteroid.positionY,
              asteroid.velocityX + Math.random() * 2,
              asteroid.velocityY + Math.random() * 2));
          asteroids.push(
            new AsteroidMedium(
              asteroid.positionX,
              asteroid.positionY,
              asteroid.velocityX + Math.random() * 2,
              asteroid.velocityY + Math.random() * 2));
          
        } else if(size == 'medium') {
          asteroids.push(
            new AsteroidSmall(
              asteroid.positionX,
              asteroid.positionY,
              asteroid.velocityX + Math.random() * 2,
              asteroid.velocityY + Math.random() * 2));
          asteroids.push(
            new AsteroidSmall(
              asteroid.positionX,
              asteroid.positionY,
              asteroid.velocityX + Math.random() * 2,
              asteroid.velocityY + Math.random() * 2));
        }
      } 
    });
  });

  bullets = bullets.filter(bullet => bullet !== undefined);
  asteroids = asteroids.filter(bullet => bullet !== undefined);
  

  ///////////
  // draw
  
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas
  ctx.fillStyle = 'black';  
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  player.draw(ctx, upPressed);
  for(let bullet of bullets) bullet.draw(ctx);
  for(let asteroid of asteroids) asteroid.draw(ctx);
  
  window.requestAnimationFrame(frame); 
}
