function draw() { 
  let canvasEl = <HTMLCanvasElement>document.getElementById('main');
  let ctx = canvasEl.getContext('2d');
  if(ctx != null) {
    ctx.fillStyle = 'rgb(200, 0, 0)';
    ctx.fillRect(10, 10, 50, 50);
  }
}
