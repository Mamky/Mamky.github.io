const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

let gameRunning = true;
let score = 0;

// Player (circle)
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    speed: 10,
    angle: 0
};

// Gun properties (attached to player)
const gun = {
    width: 30,
    height: 10,
    offsetX: 20, // Position offset relative to player
    offsetY: 0
};

// Bullets array
const bullets = [];

// Enemy (green block that follows the player)
const enemy = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    width: 35,
    height: 40,
    speed: 5
};

// Track mouse position for gun rotation
const mouse = { x: canvas.width / 2, y: canvas.height / 2 };

window.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;

    // Calculate angle between player and mouse
    player.angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
});

// Shoot bullets on left-click
window.addEventListener("mousedown", (event) => {
    if (event.button === 0) {
        const speed = 8;
        bullets.push({
            x: player.x + Math.cos(player.angle) * gun.offsetX,
            y: player.y + Math.sin(player.angle) * gun.offsetX,
            velocityX: Math.cos(player.angle) * speed,
            velocityY: Math.sin(player.angle) * speed,
            radius: 5
        });
    }
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

// Enemy follows player
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

// Update bullets
function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.velocityX;
        bullet.y += bullet.velocityY;

        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }

        // Bullet collision with enemy
        const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
        if (dist < enemy.width / 2) {
            bullets.splice(index, 1);
            score += 10;
            enemy.x = Math.random() * canvas.width;
            enemy.y = Math.random() * canvas.height;
        }
    });
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player (circle)
    ctx.fillStyle = "wheat";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw gun (attached to player)
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.fillStyle = "black";
    ctx.fillRect(gun.offsetX, gun.offsetY, gun.width, gun.height);
    ctx.restore();

    // Draw enemy (green block)
    ctx.fillStyle = "green";
    ctx.fillRect(enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height);

    // Draw bullets
    ctx.fillStyle = "gray";
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    // Display score
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 20);
}

// Game loop
function gameLoop() {
    if (gameRunning) {
        movePlayer();
        updateEnemy();
        updateBullets();
        checkCollision();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

gameLoop();
