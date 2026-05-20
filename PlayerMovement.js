// --- Game Engine Variables ---
let scene, camera, renderer, raycaster;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// --- Game Logic States ---
let score = 0;
const targets = [];
const targetSpeed = 0.05;
const boundarySize = 45; // Boundaries of our arena

// --- DOM Elements ---
const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');
const scoreVal = document.getElementById('score-val');
const canvas = document.getElementById('game-canvas');

// --- Initialization ---
init();
animate();

function init() {
    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.FogExp2(0x050505, 0.025);

    // 2. Camera Setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 2; // Player height position

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00ff66, 0.6);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    // 4. Environment (Floor and Arena Walls)
    const floorGeo = new THREE.PlaneGeometry(100, 100, 50, 50);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshBasicMaterial({ color: 0x111111, wireframe: true });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    scene.add(floor);

    // 5. Weapon Mesh attached to Camera
    const weaponGeo = new THREE.BoxGeometry(0.1, 0.1, 0.5);
    const weaponMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const weapon = new THREE.Mesh(weaponGeo, weaponMat);
    weapon.position.set(0.2, -0.2, -0.4); // Bottom right orientation
    camera.add(weapon);
    scene.add(camera);

    // 6. Raycaster & Targets Initialization
    raycaster = new THREE.Raycaster();
    for (let i = 0; i < 8; i++) {
        spawnTarget();
    }

    // 7. Renderer Setup
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 8. Pointer Lock Setup (FPS Mouse Control)
    blocker.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvas) {
            blocker.style.display = 'none';
        } else {
            blocker.style.display = 'flex';
            instructions.textContent = 'SYSTEM PAUSED. CLICK TO RESUME.';
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === canvas) {
            camera.rotation.y -= e.movementX * 0.0025;
            camera.rotation.x -= e.movementY * 0.0025;
            // Limit vertical look parameters
            camera.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, camera.rotation.x));
        }
    });

    // 9. Input Listeners
    window.addEventListener('keydown', (e) => handleInputs(e.code, true));
    window.addEventListener('keyup', (e) => handleInputs(e.code, false));
    window.addEventListener('click', () => {
        if (document.pointerLockElement === canvas) fireWeapon();
    });
    window.addEventListener('resize', onWindowResize);
}

// --- Keyboard Input Mapping ---
function handleInputs(code, isPressed) {
    switch (code) {
        case 'KeyW': case 'ArrowUp': moveForward = isPressed; break;
        case 'KeyS': case 'ArrowDown': moveBackward = isPressed; break;
        case 'KeyA': case 'ArrowLeft': moveLeft = isPressed; break;
        case 'KeyD': case 'ArrowRight': moveRight = isPressed; break;
    }
}

// --- Gameplay Mechanics ---
function spawnTarget() {
    const size = Math.random() * 1 + 0.8;
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0055, wireframe: false });
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.x = (Math.random() - 0.5) * 80;
    mesh.position.y = Math.random() * 5 + 1.5;
    mesh.position.z = (Math.random() - 0.5) * 80;
    
    // Custom movement metadata
    mesh.userData = {
        dirX: (Math.random() - 0.5),
        dirZ: (Math.random() - 0.5)
    };

    scene.add(mesh);
    targets.push(mesh);
}

function fireWeapon() {
    // Raycast straight from the center of the viewport screen frame
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(targets);

    if (intersects.length > 0) {
        const hitTarget = intersects[0].object;
        
        // Flash animation effect on elimination
        hitTarget.material.color.setHex(0x00ff66);
        
        setTimeout(() => {
            scene.remove(hitTarget);
            const index = targets.indexOf(hitTarget);
            if (index > -1) targets.splice(index, 1);
            
            score += 25;
            scoreVal.textContent = String(score).padStart(3, '0');
            
            // Replenish target populations continuously
            spawnTarget();
        }, 60);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Main Engine Game Loop ---
function animate() {
    requestAnimationFrame(animate);

    if (document.pointerLockElement === canvas) {
        const time = performance.now();
        const delta = (time - prevTime) / 1000;

        // Reduce velocity vectors via damping mechanics
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        // Establish translation heading orientation vectors
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * 40.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 40.0 * delta;

        // Apply spatial translations based on current perspective matrices
        camera.translateX(-velocity.x * delta);
        camera.translateZ(velocity.z * delta);
        camera.position.y = 2; // Prevent shifting heights on vertical pitch rotations

        // Enforce boundary colliders
        if (camera.position.x > boundarySize) camera.position.x = boundarySize;
        if (camera.position.x < -boundarySize) camera.position.x = -boundarySize;
        if (camera.position.z > boundarySize) camera.position.z = boundarySize;
        if (camera.position.z < -boundarySize) camera.position.z = -boundarySize;

        // Update Target drone transformations
        targets.forEach(target => {
            target.position.x += target.userData.dirX * targetSpeed;
            target.position.z += target.userData.dirZ * targetSpeed;
            target.rotation.x += 0.01;
            target.rotation.y += 0.02;

            // Bounce targets off invisible virtual boundaries
            if (Math.abs(target.position.x) > boundarySize) target.userData.dirX *= -1;
            if (Math.abs(target.position.z) > boundarySize) target.userData.dirZ *= -1;
        });

        prevTime = time;
    }

    renderer.render(scene, camera);
}
