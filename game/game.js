const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


let gameRunning = true;
let score = 0;

// Player (circle)
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    speed: 5,
    angle: 0
};


// Enemy (green block that follows the player(zombie))
const enemy = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    width: 35,
    height: 40,
    speed: 2
};

// Track mouse position for future gun movement
const mouse = { x: canvas.width / 2, y: canvas.height / 2 };

window.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;

    // angle between player and mouse
    player.angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
});

// Player movement (WASD keys)
const keys = {};

window.addEventListener("keydown", (event) => keys[event.key] = true);
window.addEventListener("keyup", (event) => keys[event.key] = false);

function movePlayer() {
    if (keys["w"]) player.y -= player.speed;
    if (keys["s"]) player.y += player.speed;
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;
}

// enemy follows player
function updateEnemy() {
    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    enemy.x += Math.cos(angle) * enemy.speed;
    enemy.y += Math.sin(angle) * enemy.speed;
}

// Check collision between player and enemy
function checkCollision() {
    let player_min_x = player.x - player.radius;
    let player_max_x = player.x + player.radius;
    let player_min_y = player.y - player.radius;
    let player_max_y = player.y + player.radius;

    let enemy_min_x = enemy.x - enemy.width / 2;
    let enemy_max_x = enemy.x + enemy.width / 2;
    let enemy_min_y = enemy.y - enemy.height / 2;
    let enemy_max_y = enemy.y + enemy.height / 2;

    if (
        enemy_max_y > player_min_y &&
        enemy_min_y < player_max_y &&
        enemy_max_x > player_min_x &&
        enemy_min_x < player_max_x
    ) {
        gameRunning = false;
    }
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player (human)
    ctx.fillStyle = "wheat";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw enemy (zombie)
    ctx.fillStyle = "green";
    ctx.fillRect(enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height);

    // Display score
    ctx.fillStyle = "black";
     ctx.font = "20px 'Press Start 2P', cursive";
    ctx.fillText("Score: " + score, 10, 20);
}

// Game loop
function gameLoop() {
    if (gameRunning) {
        movePlayer();
        updateEnemy();
        checkCollision();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

gameLoop();
