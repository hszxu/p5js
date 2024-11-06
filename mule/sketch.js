let gridSize = 3;
let tileWidth, tileHeight;
let litTiles = [];
let score = 5;
let lastTime = 0;
let interval;
let totalScore = 0;
let gameOver = false;
let handPose;
let video;
let hands = [];

function preload() {
  // Load the handPose model
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  // start detecting hands from the webcam video
  handPose.detectStart(video, gotHands);
  tileWidth = width / gridSize;
  tileHeight = height / gridSize;
  interval = 1000;
}

function draw() {
  background(220);

  if (!gameOver) {
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        let index = i * gridSize + j;
        fill(isTileLit(index) ? 'yellow' : 'black');
        stroke(255);
        rect(j * tileWidth, i * tileHeight, tileWidth, tileHeight);
      }
    }
    push();
    translate(width, 0);  // Move origin to the right edge
    scale(-1, 1);         // Flip horizontally
    pop();                // Restore normal drawing state
   
  // Draw all the tracked hand points
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    let keypoint = hand.keypoints[8];
    fill(0, 255, 0);
    noStroke();
    circle(width - keypoint.x, keypoint.y, 10);  // Adjust x to match flipped canvas
  }
    checkAutoTurnOffAndRelight();
    eliminate();

    fill(255);
    textSize(24);
    text(`hp: ${score}`, 10, height - 10);
    text(`score: ${totalScore}`, 520, height - 10);

    if (score <= 0) {
      gameOver = true;
      textSize(48);
      textAlign(CENTER, CENTER);
      fill('red');
      text('Game Over', width / 2, height / 2);
      textSize(24);
      text('Press R to Restart', width / 2, height / 2 + 50);
      noLoop();
    }
  } else {
    textSize(48);
    textAlign(CENTER, CENTER);
    fill('red');
    text('Game Over', width / 2, height / 2);
    textSize(24);
    text('Press R to Restart', width / 2, height / 2 + 50);
  }
}

function checkAutoTurnOffAndRelight() {
  if (millis() - lastTime > interval) {
    lastTime = millis();
    interval = random(800, 2000);
    if (litTiles.length > 0) {
      score -= litTiles.length;
      litTiles = [];
    }
    lightUpTiles();
  }
}

function lightUpTiles() {
  let numTiles = int(random(1, 3));
  for (let i = 0; i < numTiles; i++) {
    let index = int(random(0, gridSize * gridSize));
    if (!litTiles.some(tile => tile.index === index)) {
      litTiles.push({ index: index, litTime: millis() });
    }
  }
}

function isTileLit(index) {
  return litTiles.some(tile => tile.index === index);
}

function eliminate() {
  if (!gameOver) {
    for (let i = 0; i < litTiles.length; i++) {
      let tile = litTiles[i];
      let x = (tile.index % gridSize) * tileWidth;
      let y = int(tile.index / gridSize) * tileHeight;

      // For each hand, check if the index finger (keypoint 8) is over the tile
      for (let j = 0; j < hands.length; j++) {
        let hand = hands[j];
        let keypoint = hand.keypoints[8];  // The tip of the index finger

        // Adjust the x-coordinate due to canvas flipping
        let fingerX = width - keypoint.x;

        // Check if the finger is within the bounds of the tile
        if (fingerX > x && fingerX < x + tileWidth && keypoint.y > y && keypoint.y < y + tileHeight) {
          litTiles.splice(i, 1);  // Remove the lit tile
          totalScore++;
          break;  // Exit the loop once the tile is eliminated
        }
      }
    }
  }
}


function keyPressed() {
  if (gameOver && (key === 'r' || key === 'R')) {
    resetGame();
  }
}


function resetGame() {
  score = 5;
  totalScore = 0;
  litTiles = [];
  lastTime = millis();
  interval = 1000;
  gameOver = false;
  loop(); 
  textAlign(LEFT, BASELINE);
  textSize(24);
}

function gotHands(results) {
  // save the output to the hands variable
  hands = results;
}