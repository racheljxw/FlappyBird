// Board

let board;
// let boardWidth = 360;
// let boardHeight = 640;
let boardWidth = 1100;
let boardHeight = 490;
let context;

// Bird

let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 3;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

// Pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;
let dynamicOpeningSpace = 2.5;
let pipeInterval;

// Physics
let velocityX = -2;
let velocityY = 0;
let gravity = 0.35;

let gameOver = false;
let score = 0;
const highScoreStorage = "highScoreStorage";
let highScore;
loadScore();
if (highScore === undefined) highScore = 0;
let level = 1;
let levelMemory = 1;
let levelInterval = 2000;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // load images
    birdImg = new Image();
    birdImg.src = "images/flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
        console.log('Bird path:', birdImg.src);
    }

    topPipeImg = new Image();
    topPipeImg.src = "images/toppipe.png";
    bottomPipeImg = new Image();
    bottomPipeImg.src = "images/bottompipe.png";
    console.log('Top Pipe path:', topPipeImg.src);
    console.log('Bottom Pipe path:', bottomPipeImg.src);

    requestAnimationFrame(update);
    pipeInterval = setInterval(placePipes, levelInterval);
    document.addEventListener("keydown", moveBird);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }

    context.fillStyle = "white";
    context.font = "30px sans-serif";

    context.clearRect(0, 0, board.width, board.height);

    // bird
    velocityY += gravity;
    bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    // pipes

    if (levelMemory != level && level > 8 && levelInterval > 1000) {
        levelInterval -= 250;
        clearInterval(pipeInterval);
        pipeInterval = setInterval(placePipes, levelInterval);
        levelMemory = level;
    }

    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
            if (Number.isInteger(score) && Math.floor(score % 10) == 0 && score != 0) {
                level++;
            }
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    // clear pipes

    while (pipeArray.length > 0 && pipeArray[0].x < (-pipeWidth)) {
        pipeArray.shift();
    }

    // score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 10, 75);

    // level
    context.font = "25px sans-serif";
    context.fillText("Level " + level, 980, 40);

    if (gameOver) {
        context.font = "40px sans-serif";
        context.fillText("GAME OVER", 10, 120);

        if (score > highScore) {
            highScore = score;
            context.font = "15px sans-serif";
            context.fillText("High Score: " + highScore + "     NEW HIGH SCORE!!", 10, 30);
            saveScore();
        } else {
            context.font = "15px sans-serif";
            context.fillText("High Score: " + highScore, 10, 30);
        }
    } else {
        context.font = "15px sans-serif";
        context.fillText("High Score: " + highScore, 10, 30);
    }

}

function placePipes() {
    if (gameOver) {
        return;
    }

    if (levelMemory != level && dynamicOpeningSpace < 4.5) {
        dynamicOpeningSpace += 0.25;
        levelMemory = level;
    }

    let randomPipeY = pipeY - (pipeHeight / 1.8) - Math.random()*(pipeHeight / 3);
    let openingSpace = board.height / dynamicOpeningSpace;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }

    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }

    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        
        // Jump
        velocityY = -5;

        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            level = 1;
            levelMemory = 1;
            dynamicOpeningSpace = 2.5;
            levelInterval = 2000;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return  a.x < b.x + b.width && 
            a.x + a.width > b.x &&
            a.y < b.y + b.height && 
            a.y + a.height > b.y;
}

function saveScore() {
    localStorage.setItem('highScore', JSON.stringify(highScore));
    loadScore();
}

function loadScore() {
    const highScoreValue = localStorage.getItem('highScore');
    if (highScoreValue !== null) {
        highScore = JSON.parse(highScoreValue);
    }
}

