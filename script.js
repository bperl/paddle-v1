// Declare Elements
const container = document.querySelector(".container");
const paddle = document.querySelector(".paddle");
const ball = document.querySelector(".ball");
const info = document.querySelector(".info");

// Game Variables
let paddleDir; // Paddle Direction: left/right
let lives;
let bricks, leftEdge, score;
let gameInPlay = false;
let ballDir = {
  x: 5,
  y: 5
};
let ballOnPaddle = true;
let bricksAmount = 20;

// Wait until window loads to calculate brick width
window.onload = function() {
  leftEdge = container.getClientRects().x;
};

// Game Constants
const containerEdges = container.getBoundingClientRect();

// Event Listeners
document.addEventListener("keydown", handleKeyPress);
document.addEventListener("keyup", handleKeyPress);

// Create Bricks
setupBricks = numBricks => {
  const brickWidth = containerEdges.width / 10.1;
  const height = 30;
  let topDistance = 10;
  let subtractBy = 0;
  startLeft = container.getBoundingClientRect().left + brickWidth / 10;

  for (let i = 0; i < numBricks; i++) {
    const div = document.createElement("div");
    div.style.width = `${brickWidth * (9 / 10)}px`;
    div.style.height = `${height}px`;
    div.setAttribute("class", "brick");
    let leftPos = (i - subtractBy) * brickWidth;

    // If row is full, move to next row
    if (leftPos + brickWidth > containerEdges.width) {
      topDistance += height + 10;
      subtractBy = i;
      leftPos = (i - subtractBy) * brickWidth;
    }

    div.style.left = `${leftPos + startLeft}px`;
    div.style.top = `${topDistance}px`;
    container.appendChild(div);
  }
};

// Handle Paddle Moves
function handleKeyPress(e) {
  e.preventDefault();
  if (e.key === "ArrowRight") {
    if (e.type === "keydown") paddleDir = "right";
    else if (e.type === "keyup") paddleDir = null;
  } else if (e.key === "ArrowLeft") {
    if (e.type === "keydown") paddleDir = "left";
    else if (e.type === "keyup") paddleDir = null;
  } else if (e.key === "ArrowUp") {
    if (ballOnPaddle) ballOnPaddle = false;
    hideInfo();
  }
}

function startGame() {
  lives = 2;
  gameInPlay = true;
  setupBricks(bricksAmount);
  animationRepeat = requestAnimationFrame(animate);
  bricks = document.querySelectorAll(".brick");
  score = 0;
}

detectCollision = (a, b) => {
  const aEdges = a.getBoundingClientRect();
  const bEdges = b.getBoundingClientRect();

  return !(
    aEdges.bottom < bEdges.top ||
    aEdges.top > bEdges.bottom ||
    aEdges.right < bEdges.left ||
    aEdges.left > bEdges.right
  );
};

// Main Game Loop
function animate() {
  updatePaddle = () => {
    let paddlePos = paddle.offsetLeft;
    if (paddleDir === "right") paddlePos += 10;
    else if (paddleDir === "left" && paddlePos > container.offsetLeft)
      paddlePos -= 10;
    paddle.style.left = `${paddlePos}px`;
  };

  updateBall = () => {
    // Get the ball's current location
    var x = ball.offsetLeft;
    var y = ball.offsetTop;

    // If ball hits edge re-direct it
    if (
      x < container.offsetLeft ||
      x > containerEdges.width + ball.offsetWidth
    ) {
      ballDir.x *= -1;
    }

    // Uncomment this line, and comment out the next two lines for autoplay
    // if (
    //   y > containerEdges.height - ball.offsetHeight / 2 ||
    //   y < 0 + ball.offsetHeight / 2
    // ) {
    //   ballDir.y *= -1;
    // }

    if (y < 0 + ball.offsetHeight / 2) {
      ballDir.y *= -1;
    }

    if (y > containerEdges.height) endRound();

    // Check if ball hits paddle, if true reverse ball direction
    if (detectCollision(ball, paddle)) {
      ballDir.y *= -1;
    }

    // Update bricks array
    bricks = document.querySelectorAll(".brick");

    // Check if ball hits brick, if true, remove brick
    for (let brick of bricks) {
      if (detectCollision(brick, ball)) {
        score++;
        ballDir.y *= -1;
        brick.parentNode.removeChild(brick);
      }
    }

    if (!bricks.length) {
      nextLevel();
    }

    x += ballDir.x;
    y += ballDir.y;

    // Apply new position based on above calculations
    ball.style.left = `${x}px`;
    ball.style.top = `${y}px`;
  };

  ballFollowsPaddle = () => {
    ball.style.top = `${paddle.offsetTop - paddle.offsetHeight}px`;
    ball.style.left = `${paddle.offsetLeft}px`;
  };

  // Call individual update functions:
  ballOnPaddle ? ballFollowsPaddle() : updateBall();
  gameInPlay && updatePaddle();

  // Re-run game loop if game in play
  if (gameInPlay) animationRepeat = requestAnimationFrame(animate);
}

// Ball has gone below paddle
function endRound() {
  if (lives <= 0) {
    gameInPlay = false;
    showInfo("endgame");
  } else {
    ballOnPaddle = true;
    showInfo("middle");
    lives--;
  }
}

// User has complete level by removing all bricks
function nextLevel() {
  bricksAmount += 10;
  ballDir.x += 5;
  ballDir.y += 5;
  setupBricks(bricksAmount);
  ballOnPaddle = true;
  showInfo("newRound");
}

function endGame() {
  gameInPlay = false;
  ballOnPaddle = true;
}

function hideInfo() {
  info.style.top = "-100px";
  info.style.display = "none";
}

function showInfo(gameAt) {
  info.style.top = "50%";
  info.style.display = "block";

  switch (gameAt) {
    case "middle":
      info.innerHTML = `Points: ${score}<br /> Lives: ${lives}`;
      break;
    case "newRound":
      info.innerHTML = `Score is ${score}`;
      break;
    case "endgame":
      info.innerHTML = `Game Over! You scored: ${score}<br />`;
      break;

    default:
      info.innerHTML = "Press the 'Up' arrow to begin";
  }
}

startGame();
