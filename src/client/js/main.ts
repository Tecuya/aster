
declare var greinerHormann: any;

var canvas: HTMLCanvasElement;

var leftPressed: boolean;
var rightPressed: boolean;
var upPressed: boolean;
var spacePressed: boolean;

// entity slots
var player: Player;
let bullets: Bullet[] = [];
let asteroids: Asteroid[] = [];
let explosions: Explosion[] = [];

// constants
let bulletSize = 4;
let explosionRays = 11;
let deathFrameCount = 120;
let spawnGraceSize = 80;
let rounds = [1, 2, 3, 4, 5, 6, 7, 9, 12, 15, 20, 30, 50];
let rotationSpeed = 0.07;
let canvasX = 1024;
let canvasY = 576;

// derived constants
let canvasMidX = canvasX / 2;
let canvasMidY = canvasY / 2;
let spawnGraceBox = [
  [canvasMidX - spawnGraceSize, canvasMidY - spawnGraceSize],
  [canvasMidX + spawnGraceSize, canvasMidY - spawnGraceSize],
  [canvasMidX + spawnGraceSize, canvasMidY + spawnGraceSize],
  [canvasMidX - spawnGraceSize, canvasMidY + spawnGraceSize],
  [canvasMidX - spawnGraceSize, canvasMidY - spawnGraceSize]];

// initial state
let round = 0;

function init() {
  canvas = <HTMLCanvasElement>document.getElementById('main');

  canvas.width = 1024;
  canvas.height = 576;
  
  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);

  player = new Player(canvas.width / 2, canvas.height / 2, 0, 0, 0);

  initializeRound();
  
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
    if(!player.isDead()) { 
      bullets.push(
        new Bullet(
          player.positionX,
          player.positionY,
          player.velocityX + (Math.sin(player.currentRotation) * 10),
          player.velocityY + (-1 * Math.cos(player.currentRotation) * 10)));
    }
  }
}

function initializeRound(): void {
  bullets = [];
  asteroids = [];
  for(let i=0; i<rounds[round]; i++) {
    asteroids.push(
      new AsteroidLarge(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2));   
  }
  if(round > 0) {
    player.preRound();

    player.playing = true;    
    player.setDefaultPosition();
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
  } else if(e.key == "Enter" && round == 0) {
    round = 1;
    initializeRound();
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
      [0, 34],
      [28, 20],
      [30, 0],
      [28, -12],
      [2, -40],
      [-22, -36],
      [-26, -8],
      [-38, 13],
      [-24, 36],
      
      [0, 34]
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
      [7, 10],
      [14, 0],
      [14, -9],
      [6, -20],
      [-3, -18],
      [-8, -9],
      [-12, 7],
      [-12, 15],
      
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
    
    ctx.closePath();
    ctx.stroke();
    
    ctx.restore();
  }

  shouldContinue(): boolean {
    return (this.distanceTraveled < canvas.width);
  }

  getRelativeCoordinates(): number[][] {
    return [[-1 * bulletSize / 2, -1 * bulletSize / 2],
            [bulletSize / 2,      -1 * bulletSize / 2],
            [bulletSize / 2,      bulletSize / 2],
            [-1 * bulletSize / 2, bulletSize / 2],
            [-1 * bulletSize / 2, -1 * bulletSize / 2]]
  }  
}

class Player extends Collideable {

  public playing: boolean = false;
  private deathFrame: number = -1;
  
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

  isDead(): boolean {
    return this.deathFrame != -1;
  }
  
  die(): void {
    this.deathFrame = 0;
  }

  preRound(): void {
    this.deathFrame = deathFrameCount;
  }
  
  isClearToSpawn(): boolean {

    if(this.deathFrame < deathFrameCount) {
      this.deathFrame++;
      return false;
    }
    
    let clearToSpawn = true;

    asteroids.forEach((asteroid, aidx) => {
      if(greinerHormann.intersection(asteroid.getAbsoluteCoordinates(), spawnGraceBox) !== null) { 
        clearToSpawn = false;
      }
    });

    return clearToSpawn;  
  }
  
  tryToSpawn(): void {
    if(this.isClearToSpawn()) { 
      this.deathFrame = -1;
      this.setDefaultPosition();
    } 
  }

  setDefaultPosition(): void {
    this.positionX = canvas.width / 2;
    this.positionY = canvas.height / 2;
    this.velocityX = 0;
    this.velocityY = 0;
  }
  
  draw(ctx:CanvasRenderingContext2D, thrust:boolean): void {

    if(this.isDead()) {
      return;
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
      this.currentRotation -= rotationSpeed;
    }
    if(rightPressed) {
      this.currentRotation += rotationSpeed;
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
  
  if(player.playing) {
    if(player.isDead()) {      
      player.tryToSpawn();        
    } else { 
      player.handleKeys(leftPressed, rightPressed, upPressed);
      player.updatePosition();
    }
  }
  
  for(let bullet of bullets) bullet.updatePosition();
  for(let asteroid of asteroids) asteroid.updatePosition();

  // collisions
  asteroids.forEach((asteroid, aidx) => {
    bullets.forEach((bullet, bidx) => {
      
      if(greinerHormann.intersection(asteroid.getAbsoluteCoordinates(), bullet.getAbsoluteCoordinates()) !== null) { 

        delete bullets[bidx];
        delete asteroids[aidx];

        let size = asteroid.getSize();
        if(size == 'large') {
          
          asteroids.push(
            new AsteroidMedium(
              asteroid.positionX,
              asteroid.positionY,
              asteroid.velocityX + (Math.random() - 0.5),
              asteroid.velocityY + (Math.random() - 0.5)));
          asteroids.push(
            new AsteroidMedium(
              asteroid.positionX,
              asteroid.positionY,
              asteroid.velocityX + (Math.random() - 0.5) ,
              asteroid.velocityY + (Math.random() - 0.5) ));
          
        } else if(size == 'medium') {
          
          asteroids.push(
            new AsteroidSmall(
              asteroid.positionX,
              asteroid.positionY,
              asteroid.velocityX + (Math.random() - 0.5) ,
              asteroid.velocityY + (Math.random() - 0.5) ));
          asteroids.push(
            new AsteroidSmall(
              asteroid.positionX,
              asteroid.positionY,
              asteroid.velocityX + (Math.random() - 0.5) ,
              asteroid.velocityY + (Math.random() - 0.5) ));
          
        } else if(size == 'small') {

          explosions.push(
            new Explosion(
              asteroid.positionX,
              asteroid.positionY,
              0, 0));
        }
      } 
    });
    
    if(player.playing && !player.isDead() && greinerHormann.intersection(asteroid.getAbsoluteCoordinates(), player.getAbsoluteCoordinates()) !== null) {      
      player.die();
      explosions.push(
        new Explosion(
          player.positionX,
          player.positionY,
          player.velocityX,
          player.velocityY));
    }
  });
  bullets = bullets.filter(bullet => bullet !== undefined && bullet.shouldContinue());
  asteroids = asteroids.filter(asteroid => asteroid !== undefined);
  explosions = explosions.filter(explosion => explosion.shouldContinue());

  if(asteroids.length == 0) {
    round++;
    initializeRound();
  }
  
  // draw
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = 'black';  
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.font = "20px Courier";
  ctx.fillStyle = "white";
  ctx.strokeStyle = "white";
  ctx.save();
  
  if(round == 0) {
    ctx.fillText("             !! ASTER-ROID ATTAK !!", 240, 100);

    ctx.fillText("Left / Right Arrow  .  .  .  Steer Ship", 240, 160);
    ctx.fillText("             Space  .  .  .  Fire", 240, 180);
    ctx.fillText("             Enter  .  .  .  Start", 240, 200);
  } else {
    ctx.fillText(`Lives:∞  Round: ${round}`, 800, 20);
  }
  
  if(player.playing && !player.isDead()) { 
    player.draw(ctx, upPressed);
  }

  // draw respawn box for debug
  if(player.isDead()) {

    ctx.beginPath()
    spawnGraceBox.forEach((coord, idx) => {
      if(ctx == null) {
        return;
      }
      if(idx == 0) {
        ctx.moveTo(coord[0], coord[1]);
      } else {
        ctx.lineTo(coord[0], coord[1]);
      }      
    });
    ctx.closePath();
    ctx.stroke();
  }
  
  for(let bullet of bullets) bullet.draw(ctx);
  for(let asteroid of asteroids) asteroid.draw(ctx);
  for(let explosion of explosions) explosion.draw(ctx);
  
  window.requestAnimationFrame(frame); 
}
