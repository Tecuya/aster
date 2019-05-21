
declare var greinerHormann: any;

var canvas: HTMLCanvasElement;

var leftPressed: boolean;
var rightPressed: boolean;
var upPressed: boolean;
var spacePressed: boolean;

var player: Player;
let bullets: Bullet[] = [];
let asteroids: Asteroid[] = [];
let explosions: Explosion[] = [];

let bulletSize = 4;
let explosionRays = 11;
let deathFrameCount = 120;

function init() {
  canvas = <HTMLCanvasElement>document.getElementById('main');

  canvas.width = 1024;
  canvas.height = 576;
  
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

  drawRelativeCoordinates(coords: number[][], ctx:CanvasRenderingContext2D): void {
    coords.forEach((coord, idx) => {
      if(idx == 0) {
        ctx.moveTo(coord[0], coord[1]);
      } else {
        ctx.lineTo(coord[0], coord[1]);
      }      
    });
  }
}


abstract class Collideable extends Entity {
  getAbsoluteCoordinates(): number[][] {
    
    var absoluteCoords: number[][];
    absoluteCoords = [];
    
    for(let coord of this.getRelativeCoordinates()) {
      absoluteCoords.push(
        [this.positionX + coord[0],
         this.positionY + coord[1]]);
    }

    return absoluteCoords;
  }

  abstract getRelativeCoordinates(): number[][];  
}


abstract class Asteroid extends Collideable {

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

    this.drawRelativeCoordinates(this.getRelativeCoordinates(), ctx);
    
    ctx.closePath();
    ctx.stroke();
    
    ctx.restore();
  }

  abstract getSize(): string;
}

class AsteroidLarge extends Asteroid {
  getRelativeCoordinates(): number[][] {
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
  getRelativeCoordinates(): number[][] {
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
  getRelativeCoordinates(): number[][] {
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


class Explosion extends Entity {

  private frameNumber: number = 0;

  draw(ctx:CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    ctx.translate(this.positionX, this.positionY);
    
    let xrads = Math.PI*2 / explosionRays;

    for(var i=0; i<explosionRays; i++) {
      ctx.beginPath();
      ctx.moveTo(
        this.frameNumber * Math.sin(xrads * i),
        this.frameNumber * Math.cos(xrads * i));
      ctx.lineTo(
        (this.frameNumber+3) * Math.sin(xrads * i),
        (this.frameNumber+3) * Math.cos(xrads * i));
      ctx.closePath();
      ctx.stroke();
    }
    
    this.frameNumber++;
    ctx.restore();
  }

  shouldContinue(): boolean {
    return this.frameNumber < 60;
  }  
}


class Bullet extends Collideable {

  updatePosition(): void {
    super.updatePosition();
    this.wrapPosition();
  }
  
  draw(ctx:CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    ctx.translate(this.positionX, this.positionY);    
    ctx.beginPath();

    this.drawRelativeCoordinates(this.getRelativeCoordinates(), ctx);
    
    // ctx.moveTo(this.positionX, this.positionY);
    // ctx.lineTo(this.positionX + this.velocityX, this.positionY + this.velocityY);
    
    ctx.closePath();
    ctx.stroke();
    
    ctx.restore();
  }

  shouldContinue(): boolean {
    return (this.distanceTraveled < canvas.width);
  }

  getRelativeCoordinates(): number[][] {
    // a square of bulletsize pixels
    return [[-1 * bulletSize / 2, -1 * bulletSize / 2],
            [bulletSize / 2,      -1 * bulletSize / 2],
            [bulletSize / 2,      bulletSize / 2],
            [-1 * bulletSize / 2, bulletSize / 2],
            [-1 * bulletSize / 2, -1 * bulletSize / 2]]
  }  
}

class Player extends Collideable {

  public deathFrame: number = -1;
  
  constructor(
    public positionX:number,
    public positionY:number,
    public velocityX:number,
    public velocityY:number,
    public currentRotation:number) {

    super(positionX, positionY, velocityX, velocityY);    
  }

  getRelativeCoordinates(): number[][] {
    return [[0, -10],
            [-10, 10],
            [0, 7],
            [10, 10],
            [0, -10]];
  }
  
  updatePosition(): void {
    super.updatePosition();
    this.wrapPosition();
  }    

  die(): void {
    this.deathFrame = 0;
  }
  
  draw(ctx:CanvasRenderingContext2D, thrust:boolean): void {

    if(this.deathFrame > -1) {
      this.deathFrame++;

      if(this.deathFrame < deathFrameCount) {
        return;
      }
     
      this.deathFrame = -1;
      this.positionX = canvas.width / 2;
      this.positionY = canvas.height / 2;
      this.velocityX = 0;
      this.velocityY = 0;
    }
    
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;

    ctx.translate(this.positionX, this.positionY);
    ctx.rotate(this.currentRotation);
    
    ctx.beginPath();

    this.drawRelativeCoordinates(this.getRelativeCoordinates(), ctx);

    if(thrust) {
      this.drawRelativeCoordinates(
        [[-4, 14],
         [0, 18],
         [4, 14],
         [0, 7],
         [-4, 14]],
      ctx);
    }
    
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

  asteroids.forEach((asteroid, aidx) => {
    bullets.forEach((bullet, bidx) => {
      
      if(greinerHormann.intersection(asteroid.getAbsoluteCoordinates(), bullet.getAbsoluteCoordinates())) { 

        delete bullets[bidx];
        delete asteroids[aidx];

        let size = asteroid.getSize();
        if(size == 'large') {
          
          asteroids.push(
            new AsteroidMedium(
              asteroid.positionX,
              asteroid.positionY,
              asteroid.velocityX + Math.random(),
              asteroid.velocityY + Math.random()));
          asteroids.push(
            new AsteroidMedium(
              asteroid.positionX,
              asteroid.positionY,
              asteroid.velocityX + Math.random() ,
              asteroid.velocityY + Math.random() ));
          
        } else if(size == 'medium') {
          
          asteroids.push(
            new AsteroidSmall(
              asteroid.positionX,
              asteroid.positionY,
              asteroid.velocityX + Math.random() ,
              asteroid.velocityY + Math.random() ));
          asteroids.push(
            new AsteroidSmall(
              asteroid.positionX,
              asteroid.positionY,
              asteroid.velocityX + Math.random() ,
              asteroid.velocityY + Math.random() ));
          
        } else if(size == 'small') {

          explosions.push(
            new Explosion(
              asteroid.positionX,
              asteroid.positionY,
              0, 0));
        }
      } 
    });

    if(greinerHormann.intersection(asteroid.getAbsoluteCoordinates(), player.getAbsoluteCoordinates())) {      
      if(player.deathFrame == -1) { 
        player.die();
        explosions.push(
          new Explosion(
            player.positionX,
            player.positionY,
            player.velocityX,
            player.velocityY));
      }
    }
    
  });

  bullets = bullets.filter(bullet => bullet !== undefined && bullet.shouldContinue());
  asteroids = asteroids.filter(asteroid => asteroid !== undefined);
  explosions = explosions.filter(explosion => explosion.shouldContinue());
  
  ///////////
  // draw
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';  
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  player.draw(ctx, upPressed);
  for(let bullet of bullets) bullet.draw(ctx);
  for(let asteroid of asteroids) asteroid.draw(ctx);
  for(let explosion of explosions) explosion.draw(ctx);
  
  window.requestAnimationFrame(frame); 
}
