// Game Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

let score = 0;

// Player Object
const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height / 2 - 20,
    width: 40,
    height: 40,
    speed: 5,
    color: '#00adb5'
};

// Target Object
const target = {
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    color: '#ff2e63'
};

// Keyboard Input Tracking
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    s: false,
    a: false,
    d: false
};

// Event Listeners for Movement
window.addEventListener('keydown', (e) => {
    if (e.key in keys) {
        keys[e.key] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key in keys) {
        keys[e.key] = false;
    }
});

// Spawn target at a random position
function spawnTarget() {
    target.x = Math.floor(Math.random() * (canvas.width - target.width));
    target.y = Math.floor(Math.random() * (canvas.height - target.height));
}

// Collision Detection Helper
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Update Game State
function update() {
    // Horizontal Movement
    if (keys.ArrowLeft || keys.a) {
        player.x -= player.speed;
    }
    if (keys.ArrowRight || keys.d) {
        player.x += player.speed;
    }

    // Vertical Movement
    if (keys.ArrowUp || keys.w) {
        player.y -= player.speed;
    }
    if (keys.ArrowDown || keys.s) {
        player.y += player.speed;
    }

    // Canvas Boundaries Collision
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

    // Check if player collected the target
    if (checkCollision(player, target)) {
        score += 10;
        scoreElement.textContent = score;
        spawnTarget();
    }
}

// Render Graphics to Canvas
function draw() {
    // Clear canvas every frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Target
    ctx.fillStyle = target.color;
    ctx.fillRect(target.x, target.y, target.width, target.height);

    // Draw Player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Main Game Loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize Game
spawnTarget();
gameLoop();
