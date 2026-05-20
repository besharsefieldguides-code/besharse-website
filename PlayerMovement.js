// --- Core Engine Setup ---
let scene, camera, renderer, clock;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
const playerVelocity = new THREE.Vector3();

// --- Rigorous Gameplay States ---
let currentRound = 1;
let playerHealth = 100;
let ammo = 30;
let isReloading = false;
let bots = [];
const mapBoundary = 60;

// --- Gun Model & Shader Camo Properties ---
let weaponGroup, muzzleFlashMesh;
let camoMaterial;
let recoilRotation = 0;
let recoilPosition = 0;
let reloadTimer = 0;
let botFireTimer = 0;

// --- DOM Object Binding ---
const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');
const gameOverMsg = document.getElementById('game-over-msg');
const roundVal = document.getElementById('round-val');
const hpVal = document.getElementById('hp-val');
const botsVal = document.getElementById('bots-val');
const ammoVal = document.getElementById('ammo-val');
const damageOverlay = document.getElementById('damage-overlay');
const canvas = document.getElementById('game-canvas');

init();
animate();

function init() {
    clock = new THREE.Clock();

    // 1. Scene Setup with Atmospheric Fog
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Light daylight sky blue
    scene.fog = new THREE.FogExp2(0xccddee, 0.015);

    // 2. Realistic Daylight & Ambient Systems
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.2); // Warm daylight sun
    sunLight.position.set(40, 100, 20);
    scene.add(sunLight);

    // 3. Camera Rig Setup
    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.05, 1000);
    camera.position.set(0, 2, 0); 

    // 4. Realistic Terrain Floor Map
    const floorGeo = new THREE.PlaneGeometry(200, 200);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x556b2f, roughness: 0.9 }); // Ground green field
    const floor = new THREE.Mesh(floorGeo, floorMat);
    scene.add(floor);

    // 5. Generate Procedural Houses and Cover Blocks across Map
    buildTownObstacles();

    // 6. Realistic Procedural Day Sky Dome
    const skyGeo = new THREE.SphereGeometry(400, 32, 15);
    const skyMat = new THREE.MeshBasicMaterial({ color: 0x87ceeb, side: THREE.BackSide });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyDome);

    // 7. Shifting Neon Green Plasma Camo (Reverb Style)
    camoMaterial = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0.0 } },
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
                float wave = sin(vUv.x * 20.0 + time * 7.0) * cos(vUv.y * 20.0 - time * 5.0);
                float edgeIntensity = smoothstep(0.0, 0.5, wave);
                vec3 neonGreen = vec3(0.0, 1.0, 0.3);
                vec3 electricAqua = vec3(0.1, 0.8, 1.0);
                vec3 baseColor = mix(vec3(0.0, 0.3, 0.0), neonGreen, edgeIntensity);
                float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 3.0);
                gl_FragColor = vec4(baseColor + (electricAqua * fresnel * 2.0), 1.0);
            }
        `
    });

    // 8. High Fidelity AK-47 Rifle Model Build
    buildDetailedAK47();

    // 9. Match Initialization
    spawnRoundBots();

    // 10. Renderer Setup
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 11. Event Subscriptions
    blocker.addEventListener('click', () => canvas.requestPointerLock());
    document.addEventListener('pointerlockchange', () => {
        blocker.style.display = document.pointerLockElement === canvas ? 'none' : 'flex';
    });

    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === canvas) {
            camera.rotation.y -= e.movementX * 0.002;
            camera.rotation.x -= e.movementY * 0.002;
            camera.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, camera.rotation.x));
        }
    });

    window.addEventListener('keydown', (e) => handleKeyToggle(e.code, true));
    window.addEventListener('keyup', (e) => handleKeyToggle(e.code, false));
    window.addEventListener('mousedown', () => { if (document.pointerLockElement === canvas) fireActiveWeapon(); });
    window.addEventListener('resize', onWindowResize);
}

// --- Procedural Generation Functions ---
function buildTownObstacles() {
    const houseMat = new THREE.MeshStandardMaterial({ color: 0xaa8866, roughness: 0.7 }); // Wooden plank tone
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x993333, roughness: 0.6 });  // Red clay shingle tone

    const housePositions = [
        {x: -25, z: -25}, {x: 25, z: -20}, {x: -15, z: 30}, {x: 35, z: 25},
        {x: 0, z: -45}, {x: -40, z: 5}, {x: 45, z: -40}, {x: 0, z: 45}
    ];

    housePositions.forEach(pos => {
        const houseGroup = new THREE.Group();
        
        // Base structure
        const base = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 12), houseMat);
        base.position.y = 3;
        houseGroup.add(base);

        // Triangular roof
        const roofGeo = new THREE.ConeGeometry(8, 4, 4);
        roofGeo.rotateY(Math.PI / 4);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 8;
        roof.scale.set(1.3, 1, 1.5);
        houseGroup.add(roof);

        houseGroup.position.set(pos.x, 0, pos.z);
        scene.add(houseGroup);
    });
}

function buildDetailedAK47() {
    weaponGroup = new THREE.Group();
    
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.32), camoMaterial);
    weaponGroup.add(receiver);

    const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.05, 0.2), camoMaterial);
    handguard.position.set(0, -0.005, -0.22);
    weaponGroup.add(handguard);

    const barrelGeo = new THREE.CylinderGeometry(0.008, 0.01, 0.32);
    barrelGeo.rotateX(Math.PI / 2);
    const barrel = new THREE.Mesh(barrelGeo, new THREE.MeshStandardMaterial({color: 0x111111}));
    barrel.position.set(0, 0.012, -0.36);
    weaponGroup.add(barrel);

    // Curved Magazine
    const magGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
        const segment = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.045, 0.07), new THREE.MeshStandardMaterial({color: 0x18181b}));
        segment.position.set(0, -0.08 - (i * 0.035), -0.04 - (i * 0.012));
        segment.rotation.x = 0.15 + (i * 0.08);
        magGroup.add(segment);
    }
    weaponGroup.add(magGroup);

    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, 0.04), new THREE.MeshStandardMaterial({color: 0x141414}));
    grip.position.set(0, -0.07, 0.08);
    grip.rotation.x = -0.35;
    weaponGroup.add(grip);

    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.07, 0.18), camoMaterial);
    stock.position.set(0, -0.01, 0.23);
    weaponGroup.add(stock);

    const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.04, 0.01), new THREE.MeshStandardMaterial({color: 0x111111}));
    frontSight.position.set(0, 0.04, -0.48);
    weaponGroup.add(frontSight);

    weaponGroup.position.set(0.18, -0.22, -0.42);
    camera.add(weaponGroup);
    scene.add(camera);

    // Muzzle Flash
    const flashGeo = new THREE.ConeGeometry(0.05, 0.16, 6);
    flashGeo.rotateX(-Math.PI / 2);
    muzzleFlashMesh = new THREE.Mesh(flashGeo, new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0 }));
    muzzleFlashMesh.position.set(0, 0.012, -0.54);
    weaponGroup.add(muzzleFlashMesh);
}

// --- Key Management ---
function handleKeyToggle(code, isPressed) {
    switch (code) {
        case 'KeyW': moveForward = isPressed; break;
        case 'KeyS': moveBackward = isPressed; break;
        case 'KeyA': moveLeft = isPressed; break;
        case 'KeyD': moveRight = isPressed; break;
        case 'KeyR': if (isPressed && ammo < 30 && !isReloading) startReloadSequence(); break;
    }
}

// --- Rigorous Character Mesh and AI Engine ---
function createArmedSoldier() {
    const soldierGroup = new THREE.Group();

    const fatigueMat = new THREE.MeshStandardMaterial({ color: 0x2e3b2e, roughness: 0.8 }); // Camo green
    const armorMat = new THREE.MeshStandardMaterial({ color: 0x222225, roughness: 0.7 });   // Armor plates
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xc99371 });

    // Lower limbs
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.9), fatigueMat);
    leftLeg.position.set(-0.2, 0.45, 0);
    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.9), fatigueMat);
    rightLeg.position.set(0.2, 0.45, 0);
    soldierGroup.add(leftLeg, rightLeg);

    // Torso and vest
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 1.0), fatigueMat);
    torso.position.set(0, 1.35, 0);
    soldierGroup.add(torso);

    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.68, 0.42), armorMat);
    vest.position.set(0, 1.4, 0);
    soldierGroup.add(vest);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), skinMat);
    head.position.set(0, 1.95, 0);
    soldierGroup.add(head);

    // AI Rifle weapon mesh model attached directly to hand stance
    const aiRifle = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.5), new THREE.MeshStandardMaterial({color: 0x111111}));
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.14, 0.06), new THREE.MeshStandardMaterial({color: 0x0a0a0a}));
    mag.position.set(0, -0.09, -0.05);
    aiRifle.add(body, mag);
    aiRifle.position.set(0.3, 1.3, -0.3);
    soldierGroup.add(aiRifle);

    return soldierGroup;
}

function spawnRoundBots() {
    bots.forEach(bot => scene.remove(bot));
    bots = [];
    
    botsVal.textContent = currentRound;
    roundVal.textContent = currentRound;

    for (let i = 0; i < currentRound; i++) {
        const bot = createArmedSoldier();
        
        // Random layout coordinates away from player origin
        bot.position.x = (Math.random() - 0.5) * 80;
        bot.position.y = 0;
        bot.position.z = -25 - (Math.random() * 40);
        
        bot.userData = { health: 100 };
        scene.add(bot);
        bots.push(bot);
    }
}

// --- Weapon Systems & Gunplay Loop ---
function fireActiveWeapon() {
    if (ammo <= 0 || isReloading || playerHealth <= 0) {
        if (ammo <= 0 && !isReloading) startReloadSequence();
        return;
    }

    ammo--;
    ammoVal.textContent = ammo;

    recoilRotation += 0.15;
    recoilPosition += 0.05;

    muzzleFlashMesh.material.opacity = 1.0;
    setTimeout(() => { muzzleFlashMesh.material.opacity = 0.0; }, 30);

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(bots, true);

    if (intersects.length > 0) {
        let rootBot = intersects[0].object.parent;
        while (rootBot && !bots.includes(rootBot)) {
            rootBot = rootBot.parent;
        }

        if (rootBot) {
            rootBot.userData.health -= 34; // 3 shot down threshold
            
            // White damage flash indicators across hierarchy meshes
            rootBot.traverse(child => {
                if (child.isMesh && child.material) {
                    child.userData.prevColor = child.material.color.getHex();
                    child.material.color.setHex(0xffffff);
                }
            });

            setTimeout(() => {
                rootBot.traverse(child => {
                    if (child.isMesh && child.material && child.userData.prevColor !== undefined) {
                        child.material.color.setHex(child.userData.prevColor);
                    }
                });
            }, 40);

            if (rootBot.userData.health <= 0) {
                scene.remove(rootBot);
                bots = bots.filter(b => b !== rootBot);
                botsVal.textContent = bots.length;

                if (bots.length === 0) {
                    currentRound++;
                    setTimeout(() => { spawnRoundBots(); }, 800);
                }
            }
        }
    }
}

function handleAICombatCycle(delta) {
    botFireTimer += delta;
    if (botFireTimer < 0.6) return; // Fire tick gate rate
    botFireTimer = 0;

    bots.forEach(bot => {
        const distance = bot.position.distanceTo(camera.position);
        // Only shoot back if within line of sight distance profile range
        if (distance < 50 && playerHealth > 0) {
            // Apply damage calculations to player profile
            playerHealth -= 8; // Adjust to dial difficulty
            if (playerHealth < 0) playerHealth = 0;
            hpVal.textContent = playerHealth;

            // Trigger visual HUD screen edge frame flash
            damageOverlay.style.backgroundColor = "rgba(255, 0, 0, 0.4)";
            setTimeout(() => { damageOverlay.style.backgroundColor = "rgba(255, 0, 0, 0)"; }, 80);

            if (playerHealth <= 0) {
                triggerGameOverReset();
            }
        }
    });
}

function triggerGameOverReset() {
    document.exitPointerLock();
    gameOverMsg.style.display = "block";
    instructions.textContent = "CLICK TO REMATCH";
    
    // Core Game Hard Reset State modifications
    currentRound = 1;
    playerHealth = 100;
    ammo = 30;
    hpVal.textContent = playerHealth;
    ammoVal.textContent = ammo;
    
    camera.position.set(0, 2, 0);
    spawnRoundBots();
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

// --- Main Engine Animation Loop Execution ---
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    camoMaterial.uniforms.time.value += delta;

    if (document.pointerLockElement === canvas && playerHealth > 0) {
        // SNAPPY MOVEMENT ENGINE: Replaced heavy inertia damping with precise vector assignment
        const speed = 14.0;
        const forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        forwardVector.y = 0; // Lock structural altitude plane lines
        forwardVector.normalize();

        const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        rightVector.y = 0;
        rightVector.normalize();

        // Direct position alterations ensure crisp velocity cutoff profiles on key lift
        if (moveForward) camera.position.addScaledVector(forwardVector, speed * delta);
        if (moveBackward) camera.position.addScaledVector(forwardVector, -speed * delta);
        if (moveLeft) camera.position.addScaledVector(rightVector, -speed * delta);
        if (moveRight) camera.position.addScaledVector(rightVector, speed * delta);

        // Map Boundary Hard Locks
        if (Math.abs(camera.position.x) > mapBoundary) camera.position.x = Math.sign(camera.position.x) * mapBoundary;
        if (Math.abs(camera.position.z) > mapBoundary) camera.position.z = Math.sign(camera.position.z) * mapBoundary;

        // Execute Hostile AI cycles
        bots.forEach(bot => {
            const lookTarget = new THREE.Vector3().copy(camera.position);
            lookTarget.y = bot.position.y;
            bot.lookAt(lookTarget);
            
            // Advance toward active player vector positions
            const walkStep = new THREE.Vector3(0, 0, 1).applyQuaternion(bot.quaternion);
            bot.position.addScaledVector(walkStep, 3.8 * delta);
        });

        // Run bot attack timers
        handleAICombatCycle(delta);
    }

    // Procedural weapon recovery dampening loops
    recoilRotation -= recoilRotation * 9.0 * delta;
    recoilPosition -= recoilPosition * 12.0 * delta;
    
    weaponGroup.position.set(0.18, -0.22 + recoilPosition * 0.4, -0.42 + recoilPosition);
    weaponGroup.rotation.x = -recoilRotation * 0.35;

    // Reload Keyframe Stance Mechanics
    if (isReloading) {
        reloadTimer += delta;
        if (reloadTimer < 0.4) {
            weaponGroup.rotation.z += 2.5 * delta;
            weaponGroup.position.y -= 0.6 * delta;
        } else if (reloadTimer < 0.9) {
            weaponGroup.rotation.z -= 2.5 * delta;
            weaponGroup.position.y += 0.6 * delta;
        } else {
            isReloading = false;
            ammo = 30;
            ammoVal.textContent = ammo;
        }
    }

    renderer.render(scene, camera);
}
