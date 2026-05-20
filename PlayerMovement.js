// --- Core Engine Setup ---
let scene, camera, renderer, clock;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// --- Game Logic States ---
let currentRound = 1;
let ammo = 30;
let isReloading = false;
let bots = [];
const boundarySize = 40;

// --- Gun & Custom Camo Animation Variables ---
let weaponGroup, gunMesh, muzzleFlashMesh;
let camoMaterial;
let recoilRotation = 0;
let recoilPosition = 0;
let reloadTimer = 0;

// --- DOM References ---
const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');
const roundVal = document.getElementById('round-val');
const botsVal = document.getElementById('bots-val');
const ammoVal = document.getElementById('ammo-val');
const canvas = document.getElementById('game-canvas');

init();
animate();

function init() {
    clock = new THREE.Clock();

    // 1. Scene & Lighting Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x141414);
    scene.fog = new THREE.FogExp2(0x141414, 0.015);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(10, 30, 10);
    scene.add(sunLight);

    // 2. Camera Setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 2; 

    // 3. CSGO-style Prototype Test Map (Greybox style)
    const floorGeo = new THREE.PlaneGeometry(100, 100);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    scene.add(floor);

    // Add visual reference blocks around the arena map
    const boxGeo = new THREE.BoxGeometry(4, 8, 4);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 });
    for(let i = 0; i < 10; i++) {
        const structuralPillar = new THREE.Mesh(boxGeo, boxMat);
        structuralPillar.position.set((Math.random() - 0.5) * 60, 4, (Math.random() - 0.5) * 60);
        scene.add(structuralPillar);
    }

    // 4. Custom Animated Animated Camo Shader (Reverb inspired)
    camoMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 }
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec2 vUv;
            varying vec3 vNormal;
            void main() {
                // Procedural plasma movement waves matching neon green ranges
                float wave1 = sin(vUv.x * 10.0 + time * 4.0) * 0.5 + 0.5;
                float wave2 = cos(vUv.y * 10.0 - time * 3.0) * 0.5 + 0.5;
                float dynamicMix = wave1 * wave2;
                
                vec3 baseGreen = vec3(0.0, 1.0, 0.2);
                vec3 brightNeon = vec3(0.4, 1.0, 0.7);
                vec3 finalCamo = mix(baseGreen, brightNeon, dynamicMix);
                
                // Add a glowing rim lighting effect
                float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 2.0);
                finalCamo += brightNeon * fresnel * 0.6;

                gl_FragColor = vec4(finalCamo, 1.0);
            }
        `
    });

    // 5. AK-47 Assembly & Placement
    weaponGroup = new THREE.Group();
    
    // Main Receiver Body
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.4), camoMaterial);
    receiver.position.set(0, 0, 0);
    weaponGroup.add(receiver);

    // Barrel
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35), new THREE.MeshStandardMaterial({color:0x111111}));
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, -0.35);
    weaponGroup.add(barrel);

    // Curved Hand Magazine
    const magazine = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.08), new THREE.MeshStandardMaterial({color:0x151515}));
    magazine.position.set(0, -0.12, -0.05);
    magazine.rotation.x = 0.2;
    weaponGroup.add(magazine);

    // Handle Grip
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.05), new THREE.MeshStandardMaterial({color:0x151515}));
    grip.position.set(0, -0.09, 0.1);
    grip.rotation.x = -0.3;
    weaponGroup.add(grip);

    // Weapon Positioning inside view hierarchy
    weaponGroup.position.set(0.25, -0.28, -0.55);
    camera.add(weaponGroup);
    scene.add(camera);

    // 6. Muzzle Flash Geometry Setup
    const flashGeo = new THREE.ConeGeometry(0.06, 0.2, 8);
    flashGeo.rotateX(-Math.PI / 2);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0 });
    muzzleFlashMesh = new THREE.Mesh(flashGeo, flashMat);
    muzzleFlashMesh.position.set(0, 0.02, -0.55);
    weaponGroup.add(muzzleFlashMesh);

    // 7. Initialize Match Setup
    spawnRoundBots();

    // 8. Renderer Setup
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 9. Controls Handlers & Observers
    blocker.addEventListener('click', () => canvas.requestPointerLock());
    document.addEventListener('pointerlockchange', () => {
        blocker.style.display = document.pointerLockElement === canvas ? 'none' : 'flex';
    });

    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === canvas) {
            camera.rotation.y -= e.movementX * 0.0022;
            camera.rotation.x -= e.movementY * 0.0022;
            camera.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, camera.rotation.x));
        }
    });

    window.addEventListener('keydown', (e) => handleKeyToggle(e.code, true));
    window.addEventListener('keyup', (e) => handleKeyToggle(e.code, false));
    window.addEventListener('mousedown', () => { if (document.pointerLockElement === canvas) fireActiveWeapon(); });
    window.addEventListener('resize', onWindowResize);
}

function handleKeyToggle(code, isPressed) {
    switch (code) {
        case 'KeyW': moveForward = isPressed; break;
        case 'KeyS': moveBackward = isPressed; break;
        case 'KeyA': moveLeft = isPressed; break;
        case 'KeyD': moveRight = isPressed; break;
        case 'KeyR': if (isPressed && ammo < 30 && !isReloading) startReloadSequence(); break;
    }
}

// --- FPS Target Systems & Mechanics ---
function spawnRoundBots() {
    bots.forEach(bot => scene.remove(bot));
    bots = [];
    
    botsVal.textContent = currentRound;
    roundVal.textContent = currentRound;

    const botGeo = new THREE.BoxGeometry(1.2, 2.2, 1.2);
    const botMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.6 });

    for (let i = 0; i < currentRound; i++) {
        const botMesh = new THREE.Mesh(botGeo, botMat);
        // Position targets safely away from player spawn point
        botMesh.position.x = (Math.random() - 0.5) * 50;
        botMesh.position.y = 1.1;
        botMesh.position.z = -20 - (Math.random() * 20);
        
        // Track unique bot properties
        botMesh.userData = { health: 100 };
        scene.add(botMesh);
        bots.push(botMesh);
    }
}

function fireActiveWeapon() {
    if (ammo <= 0 || isReloading) {
        if (ammo <= 0) startReloadSequence();
        return;
    }

    ammo--;
    ammoVal.textContent = ammo;

    // Trigger Gun Recoil Values
    recoilRotation += 0.14;
    recoilPosition += 0.05;

    // Instantly flash fire flash indicators
    muzzleFlashMesh.material.opacity = 1.0;
    setTimeout(() => { muzzleFlashMesh.material.opacity = 0.0; }, 35);

    // Hitscan Raycaster mechanics straight down center crosshair line
    const hitcaster = new THREE.Raycaster();
    hitcaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersections = hitcaster.intersectObjects(bots);

    if (intersections.length > 0) {
        const targetedBot = intersections[0].object;
        targetedBot.userData.health -= 34; // 3 shot kill threshold
        
        // Flash bot color to signal register hit
        targetedBot.material.color.setHex(0xffffff);
        setTimeout(() => { targetedBot.material.color.setHex(0xcc2222); }, 50);

        if (targetedBot.userData.health <= 0) {
            scene.remove(targetedBot);
            bots = bots.filter(b => b !== targetedBot);
            botsVal.textContent = bots.length;

            // Handle Round Completion Phase
            if (bots.length === 0) {
                currentRound++;
                setTimeout(() => { spawnRoundBots(); }, 800);
            }
        }
    }
}

function startReloadSequence() {
    isReloading = true;
    reloadTimer = 0;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Main Engine Update & Animation Execution Frame loop ---
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    
    // Update the glowing green custom camo time uniforms
    camoMaterial.uniforms.time.value += delta;

    if (document.pointerLockElement === canvas) {
        // Linear velocity drag friction configurations
        velocity.x -= velocity.x * 12.0 * delta;
        velocity.z -= velocity.z * 12.0 * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        // Acceleration formulas
        if (moveForward || moveBackward) velocity.z -= direction.z * 55.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 55.0 * delta;

        camera.translateX(-velocity.x * delta);
        camera.translateZ(velocity.z * delta);
        camera.position.y = 2; // Locked height parameters

        // Map Boundary Restrictions
        if (Math.abs(camera.position.x) > boundarySize) camera.position.x = Math.sign(camera.position.x) * boundarySize;
        if (Math.abs(camera.position.z) > boundarySize) camera.position.z = Math.sign(camera.position.z) * boundarySize;

        // Simple Bot AI Follow Behavior
        bots.forEach(bot => {
            const trackingVector = new THREE.Vector3().copy(camera.position);
            trackingVector.y = bot.position.y; // Keep vertical height locked
            bot.lookAt(trackingVector);
            
            // Creep toward player location vector points
            const forwardStep = new THREE.Vector3(0, 0, 1).applyQuaternion(bot.quaternion);
            bot.position.addScaledVector(forwardStep, 2.5 * delta);
        });
    }

    // Dynamic Procedural Weapon Recoil Damping Animations
    recoilRotation -= recoilRotation * 8.0 * delta;
    recoilPosition -= recoilPosition * 10.0 * delta;
    
    weaponGroup.position.set(0.25, -0.28 + recoilPosition * 0.5, -0.55 + recoilPosition);
    weaponGroup.rotation.x = -recoilRotation * 0.4;

    // Procedural Reload Keyframe Interpolation Rotations
    if (isReloading) {
        reloadTimer += delta;
        // Weapon drop and twist rotation animation
        if (reloadTimer < 0.6) {
            weaponGroup.rotation.z += 2.0 * delta;
            weaponGroup.position.y -= 0.5 * delta;
        } else if (reloadTimer < 1.2) { // Resetting back up to ready stance
            weaponGroup.rotation.z -= 2.0 * delta;
            weaponGroup.position.y += 0.5 * delta;
        } else { // Finish reload state
            isReloading = false;
            ammo = 30;
            ammoVal.textContent = ammo;
        }
    }

    renderer.render(scene, camera);
}
