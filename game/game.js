const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameRunning = true;
let score = 0;
let gameOver = false;

// Player (circle)
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    speed: 5
};

// Gun (attached to player)
const gun = {
    width: 30,
    height: 10,
    offsetX: 20,
    offsetY: 0
};

// Bullets array
const bullets = [];

// Enemies array
const enemies = [];

// Background
const backgroundImage = new Image();
backgroundImage.src = "background.jpg";

// Spawn wave with both zombie types
function spawnWave() {
    for (let i = 0; i < 5; i++) {
        spawnEnemy(2); // Regular zombies
    }
    for (let i = 2; i < 4; i++) {
        spawnEnemy(4); // Fast zombies
    }
}

// Makes enemies come from the canvas ends
function spawnEnemy(speed) {
    setTimeout(() => {
        const edge = Math.floor(Math.random() * 4);
        let enemy = { width: 35, height: 40, speed: speed };

        if (edge === 0) { 
            enemy.x = Math.random() * canvas.width;
            enemy.y = -enemy.height;
        } else if (edge === 1) { 
            enemy.x = Math.random() * canvas.width;
            enemy.y = canvas.height + enemy.height;
        } else if (edge === 2) { 
            enemy.x = -enemy.width;
            enemy.y = Math.random() * canvas.height;
        } else { 
            enemy.x = canvas.width + enemy.width;
            enemy.y = Math.random() * canvas.height;
        }

        enemies.push(enemy);
    }, 500);
}

// Track mouse position for gun spin
const mouse = { x: canvas.width / 2, y: canvas.height / 2 };

window.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;

    player.angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
});

// Shoot bullet on left mouse click
window.addEventListener("mousedown", (event) => {
    if (event.button === 0) {
        const speed = 6;
        bullets.push({
            x: player.x + Math.cos(player.angle) * gun.offsetX,
            y: player.y + Math.sin(player.angle) * gun.offsetX,
            velocityX: Math.cos(player.angle) * speed,
            velocityY: Math.sin(player.angle) * speed,
            radius: 5
        });
    }
});

// Player movement WASD with barrier
const keys = {};

window.addEventListener("keydown", (event) => keys[event.key] = true);
window.addEventListener("keyup", (event) => keys[event.key] = false);

function movePlayer() {
    if (keys["w"] && player.y - player.radius > 0) player.y -= player.speed;
    if (keys["s"] && player.y + player.radius < canvas.height) player.y += player.speed;
    if (keys["a"] && player.x - player.radius > 0) player.x -= player.speed;
    if (keys["d"] && player.x + player.radius < canvas.width) player.x += player.speed;
}

// Enemies follow player and avoid collisions
function updateEnemies() {
    enemies.forEach((enemy, index) => {
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.x += Math.cos(angle) * enemy.speed;
        enemy.y += Math.sin(angle) * enemy.speed;

        // Prevent zombies from overlapping
        enemies.forEach((otherEnemy, otherIndex) => {
            if (index !== otherIndex) {
                const dist = Math.hypot(enemy.x - otherEnemy.x, enemy.y - otherEnemy.y);
                if (dist < enemy.width) {
                    // Push zombies apart slightly
                    const pushAngle = Math.atan2(otherEnemy.y - enemy.y, otherEnemy.x - enemy.x);
                    enemy.x -= Math.cos(pushAngle) * 2;
                    enemy.y -= Math.sin(pushAngle) * 2;
                }
            }
        });
    });
}

// Check collision between player and enemies
function checkCollisions() {
    enemies.forEach(enemy => {
        let dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist < player.radius + enemy.width / 2) {
            gameRunning = false;
            gameOver = true;
        }
    });
}

// Bullets get updated
function updateBullets() {
    bullets.forEach((bullet, bulletIndex) => {
        bullet.x += bullet.velocityX;
        bullet.y += bullet.velocityY;

        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(bulletIndex, 1);
        }

        enemies.forEach((enemy, enemyIndex) => {
            const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
            if (dist < enemy.width / 2) {
                bullets.splice(bulletIndex, 1);
                score += 10;
                enemies.splice(enemyIndex, 1);

                // **Wave only respawns when all zombies are gone**
                if (enemies.length === 0) {
                    spawnWave();
                }
            }
        });
    });
}

// game over screen
function drawGameOverScreen() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "40px 'Press Start 2P', cursive";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

    ctx.font = "20px 'Press Start 2P', cursive";
    ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 50);
      ctx.fillText("Click R to Restart", canvas.width / 2, canvas.height / 2 + 90);
}

// Click to restart
window.addEventListener("keydown", (event) => {
    if (gameOver && event.key.toLowerCase() === "r") {
        restartGame();
    }
});

function restartGame() {
    gameRunning = true;
    gameOver = false;
    score = 0;
    bullets.length = 0;
    enemies.length = 0;
    spawnWave();
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    if (gameOver==true) {
        drawGameOverScreen();
        return;
    }

    ctx.fillStyle = "wheat";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.fillStyle = "black";
    ctx.fillRect(gun.offsetX, gun.offsetY, gun.width, gun.height);
    ctx.restore();

    ctx.fillStyle = "green";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height);
        ctx.strokeRect(enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height);
    });

    ctx.fillStyle = "rgb(169, 169, 169)";
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.fillStyle = "black";
    ctx.font = "20px 'Press Start 2P', cursive";
    ctx.fillText("Score: " + score, 10, 20);
}

// gamr loop
function gameLoop() {
    if (gameRunning) {
        movePlayer();
        updateEnemies();
        updateBullets();
        checkCollisions();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

// Start game
spawnWave();
gameLoop();