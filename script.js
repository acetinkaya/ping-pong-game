const canvas = document.getElementById("pong");
const context = canvas.getContext("2d");
const menu = document.getElementById("menu");
const settings = document.getElementById("settings");
const gameOverScreen = document.getElementById("game-over");
const winnerText = document.getElementById("winner");

let gameMode = "";
let matchType = 1;
let playerScores = [0, 0];
const player = { x: 10, y: canvas.height / 2 - 50, width: 10, height: 100, color: "#ffffff", score: 0, dy: 0 };
const ai = { x: canvas.width - 20, y: canvas.height / 2 - 50, width: 10, height: 100, color: "#ffffff", score: 0, dy: 0 };
const ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 10, speed: 5, velocityX: 5, velocityY: 5, color: "#ffffff" };

const paddleSpeed = 7;
const maxBallSpeed = 12;
const acceleration = 0.2; // Controls ball speed increase per hit

function selectMode(mode) {
    gameMode = mode;
    menu.style.display = "none";
    settings.style.display = "block";
}

function startGame(type) {
    matchType = type;
    settings.style.display = "none";
    canvas.style.display = "block";
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    player.score = 0;
    ai.score = 0;
    playerScores = [0, 0];
    resetBall();
    gameOverScreen.style.display = "none";
    menu.style.display = "block";
}

function checkWinner() {
    if (player.score >= matchType || ai.score >= matchType) {
        canvas.style.display = "none";
        gameOverScreen.style.display = "block";
        winnerText.textContent = player.score > ai.score ? "Player 1 Wins!" : "Player 2 Wins!";
        return true;
    }
    return false;
}

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#121212";
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < canvas.height; i += 25) {
        context.fillStyle = "#444";
        context.fillRect(canvas.width / 2 - 1, i, 2, 10);
    }

    context.fillStyle = player.color;
    context.fillRect(player.x, player.y, player.width, player.height);

    context.fillStyle = ai.color;
    context.fillRect(ai.x, ai.y, ai.width, ai.height);

    context.fillStyle = ball.color;
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();

    context.fillStyle = "#ffffff";
    context.font = "20px Roboto, sans-serif";
    context.fillText(player.score, canvas.width / 4, 40);
    context.fillText(ai.score, (canvas.width * 3) / 4, 40);
}

function update() {
    if (checkWinner()) return;

    // Update paddle positions
    player.y += player.dy;
    ai.y += ai.dy;

    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvas.height) ai.y = canvas.height - ai.height;

    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.velocityY = -ball.velocityY;
    }

    if (gameMode === "human-ai") {
        const reactionSpeed = 0.07 + Math.random() * 0.03; // Add slight AI imperfection
        ai.y += (ball.y - (ai.y + ai.height / 2)) * reactionSpeed;
    }

    let paddle = ball.x < canvas.width / 2 ? player : ai;

    if (
        ball.x + ball.radius > paddle.x &&
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.y + ball.radius > paddle.y &&
        ball.y - ball.radius < paddle.y + paddle.height
    ) {
        const collisionPoint = ball.y - (paddle.y + paddle.height / 2);
        const normalizedPoint = collisionPoint / (paddle.height / 2);
        const angle = normalizedPoint * Math.PI / 4; // Max bounce angle

        ball.velocityX = (paddle === player ? 1 : -1) * ball.speed * Math.cos(angle);
        ball.velocityY = ball.speed * Math.sin(angle);

        ball.speed = Math.min(ball.speed + acceleration, maxBallSpeed);
    }

    if (ball.x - ball.radius < 0) {
        ai.score++;
        playerScores[1]++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        player.score++;
        playerScores[0]++;
        resetBall();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 5;
    ball.velocityX = Math.random() > 0.5 ? 5 : -5;
    ball.velocityY = Math.random() > 0.5 ? 5 : -5;
}

function gameLoop() {
    update();
    render();
    if (!checkWinner()) requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (e) => {
    if (gameMode === "player-player") {
        if (e.key === "w") player.dy = -paddleSpeed;
        if (e.key === "s") player.dy = paddleSpeed;
        if (e.key === "ArrowUp") ai.dy = -paddleSpeed;
        if (e.key === "ArrowDown") ai.dy = paddleSpeed;
    }
});

window.addEventListener("keyup", (e) => {
    if (gameMode === "player-player") {
        if (e.key === "w" || e.key === "s") player.dy = 0;
        if (e.key === "ArrowUp" || e.key === "ArrowDown") ai.dy = 0;
    }
});

canvas.addEventListener("mousemove", (event) => {
    if (gameMode === "human-ai") {
        let rect = canvas.getBoundingClientRect();
        player.y = event.clientY - rect.top - player.height / 2;
    }
});
