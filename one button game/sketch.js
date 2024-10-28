let player;
let obstacle;
let monster;
let bullets = []; 
let gravity = 0.6;
let jumpForce = -12;
let groundHeight = 50;
let score = 0;
let gameOver = false;

function setup() {
  createCanvas(800, 400);
  
  player = new Player();
  
  obstacle = new Obstacle();
  
  monster = new Monster();
}

function draw() {
  background(200);

  fill(0);
  rect(0, height - groundHeight, width, groundHeight);
  
  if (!gameOver) {

    player.update();
    player.display();
    
    obstacle.update();
    obstacle.display();
    
    monster.update();
    monster.display();

    if (obstacle.hits(player)) {
      gameOver = true;
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
      bullets[i].update();
      bullets[i].display();

      if (bullets[i].hits(player)) {
        gameOver = true;
      }
      
      if (bullets[i].offscreen()) {
        bullets.splice(i, 1);
      }
    }
    
    textSize(32);
    fill(0);
    text(`Score: ${score}`, 10, 40);
    score++;
  } else {
    textSize(50);
    fill(220, 80, 0);
    textAlign(CENTER);
    text('Game Over!', width / 2, height / 2);
    
    textSize(20);
    textAlign(CENTER);
    text('Press R to Restart', width / 2 , height / 2 + 50);
    
    textSize(20);
    textAlign(CENTER);
    text('Your score: ' + score, width / 2 , height / 2 + 80);
  }
}


class Player {
  constructor() {
    this.x = 50;
    this.y = height - groundHeight;
    this.r = 40;
    this.ySpeed = 0;
    this.jumpCount = 0;
    this.maxJumps = 2;
  }
  
  update() {
    this.ySpeed += gravity;
    this.y += this.ySpeed;
    
    if (this.y > height - groundHeight - this.r / 2) {
      this.y = height - groundHeight - this.r / 2;
      this.ySpeed = 0;
      this.jumpCount = 0;
    }
  }
  
  display() {
    fill(255, 80, 80);
    ellipse(this.x, this.y, this.r);
  }
  
  jump() {
    if (this.jumpCount < this.maxJumps) {
      this.ySpeed = jumpForce;
      this.jumpCount++;
    }
  }
}


class Obstacle {
  constructor() {
    this.x = width;
    this.y = height - groundHeight;
    this.w = 40;
    this.h = 60;
    this.speed = 6;
  }
  
  update() {
    this.x -= this.speed;

    if (this.x < -this.w) {
      this.x = width;
      this.speed += 0.2;
    }
  }
  
  display() {
    fill(50, 50, 255);
    rect(this.x, this.y - this.h, this.w, this.h);
  }
  
  hits(player) {
    let halfPlayer = player.r / 2;
    return (player.x + halfPlayer > this.x && 
            player.x - halfPlayer < this.x + this.w && 
            player.y + halfPlayer > this.y - this.h);
  }
}

class Monster {
  constructor() {
    this.x = width - 100;
    this.y = height - groundHeight - 100;
    this.w = 60;
    this.h = 100;
    this.shootInterval = 100;
    this.timer = 0;
  }
  
  update() {
    this.timer++;
    if (this.timer >= this.shootInterval) {
      this.shoot();
      this.timer = 0;
    }
  }
  
  display() {
    fill(80, 50, 150);
    rect(this.x, this.y, this.w, this.h);
  }
  
  shoot() {
    let angle = random(0, -10);
    let rad = radians(angle);
    let bullet = new Bullet(this.x, this.y + this.h / 2, rad);
    bullets.push(bullet);
  }
}

class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.r = 10;
    this.speed = 8;
    this.xSpeed = this.speed * cos(angle);
    this.ySpeed = this.speed * sin(angle);
  }
  
  update() {
    this.x -= this.xSpeed;
    this.y += this.ySpeed;
  }
  
  display() {
    fill(0);
    ellipse(this.x, this.y, this.r * 2);
  }
  
  hits(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    return d < this.r + player.r / 2;
  }
  
  offscreen() {
    return this.x < -this.r || this.y > height || this.y < 0;
  }
}

function mousePressed() {
  if (!gameOver) {
    player.jump();
  }
}

function keyPressed() {
  if (gameOver && (key == 'r' || key == 'R')) {
    gameOver = false;
    score = 0;
    obstacle = new Obstacle();
    monster = new Monster();
    bullets = [];
  }
  if (key == " "){
    if(!gameOver){
      player.jump();
    }
  }
}
