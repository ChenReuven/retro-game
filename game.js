const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 10;

let playerPaddle = { x: 10, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, dy: 0 };
let aiPaddle = { x: canvas.width - 20, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, dy: 0 };
let ball = { x: canvas.width / 2, y: canvas.height / 2, size: ballSize, dx: 4, dy: 4 };

let playerScore = 0;
let aiScore = 0;
let aiSpeed = 0.05; // Default to beginner
let gameRunning = true;

let gamepadIndex = null;

window.addEventListener("gamepadconnected", (e) => {
    gamepadIndex = e.gamepad.index;
    console.log("Gamepad connected at index " + gamepadIndex);
});

window.addEventListener("gamepaddisconnected", (e) => {
    if (gamepadIndex === e.gamepad.index) {
        gamepadIndex = null;
        console.log("Gamepad disconnected from index " + gamepadIndex);
    }
});

function updateGamepad() {
    if (gamepadIndex !== null) {
        const gamepad = navigator.getGamepads()[gamepadIndex];
        if (gamepad) {
            const axisValue = gamepad.axes[1]; // Assuming the left stick vertical axis
            playerPaddle.dy = axisValue * 6; // Adjust the multiplier as needed
        }
    }
}

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawBall(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
}

function drawText(text, x, y, color) {
    ctx.fillStyle = color;
    ctx.font = '20px "Press Start 2P"';
    ctx.fillText(text, x, y);
}

function update() {
    if (!gameRunning) return;

    updateGamepad(); // Add this line to update gamepad input

    // Move player paddle
    playerPaddle.y += playerPaddle.dy;
    if (playerPaddle.y < 0) playerPaddle.y = 0;
    if (playerPaddle.y + paddleHeight > canvas.height) playerPaddle.y = canvas.height - paddleHeight;

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y < 0 || ball.y + ballSize > canvas.height) {
        ball.dy *= -1;
    }

    // Ball collision with paddles
    if (ball.x < playerPaddle.x + paddleWidth && ball.y > playerPaddle.y && ball.y < playerPaddle.y + paddleHeight) {
        ball.dx *= -1;
    }
    if (ball.x + ballSize > aiPaddle.x && ball.y > aiPaddle.y && ball.y < aiPaddle.y + paddleHeight) {
        ball.dx *= -1;
    }

    // Ball out of bounds
    if (ball.x < 0) {
        aiScore++;
        resetBall();
    }
    if (ball.x + ballSize > canvas.width) {
        playerScore++;
        resetBall();
    }

    // AI paddle movement
    aiPaddle.y += (ball.y - (aiPaddle.y + paddleHeight / 2)) * aiSpeed;

    // Check for game end
    if (playerScore >= 5 || aiScore >= 5) {
        gameRunning = false;
        displayWinner();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx *= -1;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height, 'white');
    drawRect(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height, 'white');
    drawBall(ball.x, ball.y, ball.size, 'white');
    drawText(`Player: ${playerScore}`, 20, 30, 'white');
    drawText(`AI: ${aiScore}`, canvas.width - 100, 30, 'white');
}

function gameLoop() {
    update();
    draw();
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

function displayWinner() {
    const winnerText = playerScore >= 5 ? 'Player Wins!' : 'AI Wins!';
    document.getElementById('winnerText').innerText = winnerText;
    document.getElementById('winnerDisplay').style.display = 'flex';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') playerPaddle.dy = -6;
    if (e.key === 'ArrowDown') playerPaddle.dy = 6;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') playerPaddle.dy = 0;
});

document.getElementById('startButton').addEventListener('click', () => {
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    if (difficulty === 'beginner') {
        aiSpeed = 0.05;
    } else if (difficulty === 'medium') {
        aiSpeed = 0.1;
    } else if (difficulty === 'expert') {
        aiSpeed = 0.15;
    }
    document.getElementById('splashScreen').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'flex';
    gameRunning = true;
    gameLoop();
});

document.getElementById('exitButton').addEventListener('click', () => {
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('splashScreen').style.display = 'flex';
    playerScore = 0;
    aiScore = 0;
    gameRunning = false;
});

document.getElementById('restartButton').addEventListener('click', () => {
    document.getElementById('winnerDisplay').style.display = 'none';
    playerScore = 0;
    aiScore = 0;
    gameRunning = true;
    gameLoop();
});