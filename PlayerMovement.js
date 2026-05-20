// --- Core Engine Architecture Setup ---
let scene, camera, renderer, clock;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false, wantToJump = false;

// --- Rigorous Camera Rotation System Tracking ---
let cameraPitch = 0;   
let cameraYaw = 0;     

// --- Physics Vectors & Variables ---
let playerHeightVelocity = 0;
let isGrounded = true;
const gravityConstant = 35.0;
const jumpImpulseForce = 12.0;

// --- Gameplay Variable Trees ---
let currentRound = 1;
let playerHealth = 100;
let playerGrenades = 1; // Explicit rule: Max 1 Grenade Capacity
let isReloading = false;
let isAimingADS = false;
let bots = [];
let activeGrenades = [];
let explosionParticles = [];
const mapBoundary = 75;

// --- Procedural Weapon Animation Properties ---
let recoilRotation = 0;
let recoilPosition = 0;

// --- Automatic & Semi-Automatic Input Safety Clocks ---
let isFiringTriggerHeld = false;
let fireRateTimer = 0;
let hasFiredPistolThisClick = false; // Tracking gate to enforce semi-automatic action

// --- Multi-Weapon Profile Matrices ---
const WEAPONS = {
    PRIMARY: {
        name: "AK-47 ASSAULT RIFLE",
        ammo: 30,
        maxAmmo: 30,
        fireRate: 0.13,     // Regulated authentic automatic speed cycle
        damage: 34,
        isAutomatic: true,
        recoilRot: 0.12,
        recoilPos: 0.04,
        hipfirePos: new THREE.Vector3(0.16, -0.20, -0.40),
        adsPos: new THREE.Vector3(0.0, -0.138, -0.30),
        modelGroup: null,
        muzzleFlash: null,
        audioFreq: 110       // Base engine rumble frequency
    },
    SECONDARY: {
        name: "TACTICAL PISTOL",
        ammo: 15,
        maxAmmo: 15,
        fireRate: 0.05,     // Instantaneous action gating response limit
        damage: 25,
        isAutomatic: false, // Explicit Rule: Semi-Automatic Action
        recoilRot: 0.08,
        recoilPos: 0.02,
        hipfirePos: new THREE.Vector3(0.12, -0.16, -0.32),
        adsPos: new THREE.Vector3(0.0, -0.118, -0.22),
        modelGroup: null,
        muzzleFlash: null,
        audioFreq: 190       // Snappy, lighter pop sound wave
    }
};
let currentWeaponType = "PRIMARY"; 

// --- Audio Hardware Variable Node Layer ---
let audioCtx = null;

// --- Operational Timers ---
let reloadTimer = 0;
let botFireTimer = 0;

// --- Binding DOM Element Nodes ---
const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');
const gameOverMsg = document.getElementById('game-over-msg');
const roundVal = document.getElementById('round-val');
const hpVal = document.getElementById('hp-val');
const botsVal = document.getElementById('bots-val');
const ammoVal = document.getElementById('ammo-val');
const maxAmmoVal = document.getElementById('max-ammo-val');
const grenadeVal = document.getElementById('grenade-val');
const weaponNameHUD = document.getElementById('weapon-name');
const damageOverlay = document.getElementById('damage-overlay');
const crosshairContainer = document.getElementById('crosshair-container');
const canvas = document.getElementById('game-canvas');

// Runtime Trigger Initializations
init();
animate();

function init() {
    clock = new THREE.Clock();

    // 1. Structural Scene Core Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1c23); 
    scene.fog = new THREE.FogExp2(0x1a1c23, 0.015);

    // 2. High-Fidelity Tactical Environmental Illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const keySun = new THREE.DirectionalLight(0xdff9fb, 0.85);
    keySun.position.set(50, 120, 30);
    scene.add(keySun);

    const groundFillLight = new THREE.DirectionalLight(0xffbe76, 0.2);
    groundFillLight.position.set(-50, -20, -30);
    scene.add(groundFillLight);

    // 3. Perspective Camera Layer Setup
    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.05, 1000);
    camera.rotation.order = "YXZ"; 
    camera.position.set(0, 2, 0); 

    // 4. Urban Ground Mesh Setup
    const floorGeo = new THREE.PlaneGeometry(300, 300);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.85, metalness: 0.1 }); 
    const floor = new THREE.Mesh(floorGeo, floorMat);
    scene.add(floor);

    // 5. Build Map Obstacles
    buildMilitaryOutpost();

    // 6. Generate Structural Weapon Meshes
    buildDetailedAK47();
    buildDetailedPistol();

    // Enforce baseline loadout visibility states
    WEAPONS.PRIMARY.modelGroup.visible = true;
    WEAPONS.SECONDARY.modelGroup.visible = false;

    // 7. Deploy Combat Waves
    spawnRoundBots();

    // 8. Renderer Infrastructure Binding
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 9. Interactive Hardware Event Listeners
    blocker.addEventListener('click', () => {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        canvas.requestPointerLock();
    });
    
    document.addEventListener('pointerlockchange', () => {
        blocker.style.display = document.pointerLockElement === canvas ? 'none' : 'flex';
    });

    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === canvas) {
            const sensitivity = 0.0018;
            cameraYaw -= e.movementX * sensitivity;
            cameraPitch -= e.movementY * sensitivity;
            cameraPitch = Math.max(-Math.PI / 2.05, Math.min(Math.PI / 2.05, cameraPitch));

            camera.rotation.x = cameraPitch;
            camera.rotation.y = cameraYaw;
        }
    });

    window.addEventListener('keydown', (e) => handleKeyToggle(e.code, true));
    window.addEventListener('keyup', (e) => handleKeyToggle(e.code, false));
    
    window.addEventListener('mousedown', (e) => {
        if (document.pointerLockElement !== canvas) return;
        if (e.button === 0) {
            isFiringTriggerHeld = true;
            // Semi-auto weapon activation check on first mouse press frame
            if (!WEAPONS[currentWeaponType].isAutomatic && !hasFiredPistolThisClick) {
                executeSingleWeaponFireCycle();
            }
        }
        if (e.button === 2) toggleADS(true);              
    });
    window.addEventListener('mouseup', (e) => {
        if (e.button === 0) {
            isFiringTriggerHeld = false;
            hasFiredPistolThisClick = false; // Reset trigger safety lock on button release
        }
        if (e.button === 2) toggleADS(false);             
    });
    
    window.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('resize', onWindowResize);
    
    // Explicit HUD binding call
    updateWeaponHUD();
}

// --- High Fidelity Military Audio Synthesizers ---
function playWeaponAudioFeedback(frequencyValue, isAI = false) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    // High-impact low frequency thud explosion node connection
    const lowOsc = audioCtx.createOscillator();
    const lowGain = audioCtx.createGain();
    lowOsc.type = 'sawtooth';
    lowOsc.frequency.setValueAtTime(frequencyValue, now);
    lowOsc.frequency.linearRampToValueAtTime(20, now + 0.12);
    
    lowGain.gain.setValueAtTime(isAI ? 0.35 : 0.8, now);
    lowGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    
    // Sharp metal percussion friction shell casing snap emulator
    const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.08, audioCtx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
        noiseData[i] = Math.random() * 2 - 1;
    }
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(isAI ? 900 : 1600, now);
    
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(isAI ? 0.4 : 0.9, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    
    lowOsc.connect(lowGain);
    lowGain.connect(audioCtx.destination);
    
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    
    lowOsc.start(now);
    lowOsc.stop(now + 0.15);
    noiseSource.start(now);
    noiseSource.stop(now + 0.08);
}

function playExplosionAudioFeedback() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const baseOsc = audioCtx.createOscillator();
    const baseGain = audioCtx.createGain();
    
    baseOsc.type = 'triangle';
    baseOsc.frequency.setValueAtTime(90, now);
    baseOsc.frequency.linearRampToValueAtTime(10, now + 0.55);
    
    baseGain.gain.setValueAtTime(2.0, now);
    baseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    
    const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.5, audioCtx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) noiseData[i] = Math.random() * 2 - 1;
    
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    
    const lowpass = audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(180, now);
    
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(2.5, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    baseOsc.connect(baseGain);
    baseGain.connect(audioCtx.destination);
    noiseSource.connect(lowpass);
    lowpass.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    
    baseOsc.start(now); baseOsc.stop(now + 0.6);
    noiseSource.start(now); noiseSource.stop(now + 0.6);
}

// --- Outpost Environment Map Generation ---
function buildMilitaryOutpost() {
    const blockMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, roughness: 0.9, metalness: 0.2 }); 
    const hazardMat = new THREE.MeshStandardMaterial({ color: 0xd63031, roughness: 0.6 });  

    const bunkerPositions = [
        {x: -30, z: -30, w: 16, h: 6, d: 16},
        {x: 30, z: -25, w: 14, h: 6, d: 14},
        {x: -20, z: 35, w: 18, h: 5, d: 12},
        {x: 40, z: 30, w: 12, h: 7, d: 12},
        {x: 0, z: -55, w: 25, h: 8, d: 10}
    ];

    bunkerPositions.forEach(b => {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), blockMat);
        wall.position.set(b.x, b.h / 2, b.z);
        scene.add(wall);
    });

    // Deploy red volatile strategic containment barrels
    for (let i = 0; i < 15; i++) {
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.4, 12), hazardMat);
        barrel.position.set((Math.random() - 0.5) * 90, 0.7, (Math.random() - 0.5) * 90);
        scene.add(barrel);
    }
}

// --- Structural Gun Asset Models ---
function buildDetailedAK47() {
    const group = new THREE.Group();
    const gunSteel = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.5, metalness: 0.8 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xbdc581, roughness: 0.7 }); // Desert-tan modern finish

    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.055, 0.35), gunSteel);
    group.add(receiver);

    const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.033, 0.045, 0.22), woodMat);
    handguard.position.set(0, -0.005, -0.22);
    group.add(handguard);

    const barrelGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.35);
    barrelGeo.rotateX(Math.PI / 2);
    const barrel = new THREE.Mesh(barrelGeo, gunSteel);
    barrel.position.set(0, 0.01, -0.38);
    group.add(barrel);

    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.085, 0.038), gunSteel);
    grip.position.set(0, -0.065, 0.06);
    grip.rotation.x = -0.4;
    group.add(grip);

    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.065, 0.18), woodMat);
    stock.position.set(0, -0.01, 0.23);
    group.add(stock);

    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.15, 0.075), gunSteel);
    mag.position.set(0, -0.09, -0.06);
    mag.rotation.x = 0.25;
    group.add(mag);

    group.position.copy(WEAPONS.PRIMARY.hipfirePos);
    camera.add(group);

    const flashGeo = new THREE.ConeGeometry(0.04, 0.15, 6);
    flashGeo.rotateX(-Math.PI / 2);
    const flashMesh = new THREE.Mesh(flashGeo, new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0 }));
    flashMesh.position.set(0, 0.01, -0.56);
    group.add(flashMesh);

    WEAPONS.PRIMARY.modelGroup = group;
    WEAPONS.PRIMARY.muzzleFlash = flashMesh;
}

function buildDetailedPistol() {
    const group = new THREE.Group();
    const tacticalGray = new THREE.MeshStandardMaterial({ color: 0x34495e, roughness: 0.4, metalness: 0.7 });
    const polymerBlack = new THREE.MeshStandardMaterial({ color: 0x1e272e, roughness: 0.8 });

    const slide = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.034, 0.19), tacticalGray);
    slide.position.set(0, 0.02, -0.02);
    group.add(slide);

    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.02, 0.15), polymerBlack);
    frame.position.set(0, 0.0, -0.03);
    group.add(frame);

    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.075, 0.034), polymerBlack);
    grip.position.set(0, -0.04, 0.02);
    grip.rotation.x = -0.25;
    group.add(grip);

    group.position.copy(WEAPONS.SECONDARY.hipfirePos);
    camera.add(group);

    const flashGeo = new THREE.ConeGeometry(0.03, 0.11, 5);
    flashGeo.rotateX(-Math.PI / 2);
    const flashMesh = new THREE.Mesh(flashGeo, new THREE.MeshBasicMaterial({ color: 0xffbb44, transparent: true, opacity: 0 }));
    flashMesh.position.set(0, 0.02, -0.14);
    group.add(flashMesh);

    WEAPONS.SECONDARY.modelGroup = group;
    WEAPONS.SECONDARY.muzzleFlash = flashMesh;
}

// --- Input Matrix Management ---
function handleKeyToggle(code, isPressed) {
    switch (code) {
        case 'KeyW': moveForward = isPressed; break;
        case 'KeyS': moveBackward = isPressed; break;
        case 'KeyA': moveLeft = isPressed; break;
        case 'KeyD': moveRight = isPressed; break;
        case 'Space': wantToJump = isPressed; break;
        case 'KeyG': if (isPressed && playerHealth > 0) throwEquipmentGrenade(); break;
        case 'KeyR': if (isPressed && !isReloading) {
            const activeWep = WEAPONS[currentWeaponType];
            if (activeWep.ammo < activeWep.maxAmmo) startReloadSequence();
        } break;
        case 'KeyY': if (isPressed && playerHealth > 0 && !isReloading) swapActiveWeaponLoadout(); break;
    }
}

function toggleADS(stateActive) {
    if (playerHealth <= 0 || isReloading) return;
    isAimingADS = stateActive;
    crosshairContainer.style.opacity = isAimingADS ? "0" : "1"; 
}

function swapActiveWeaponLoadout() {
    isFiringTriggerHeld = false; 
    hasFiredPistolThisClick = false;
    
    if (currentWeaponType === "PRIMARY") {
        currentWeaponType = "SECONDARY";
        WEAPONS.PRIMARY.modelGroup.visible = false;
        WEAPONS.SECONDARY.modelGroup.visible = true;
    } else {
        currentWeaponType = "PRIMARY";
        WEAPONS.SECONDARY.modelGroup.visible = false;
        WEAPONS.PRIMARY.modelGroup.visible = true;
    }
    
    updateWeaponHUD();
}

function updateWeaponHUD() {
    const activeWep = WEAPONS[currentWeaponType];
    weaponNameHUD.textContent = activeWep.name;
    ammoVal.textContent = activeWep.ammo;
    maxAmmoVal.textContent = activeWep.maxAmmo;
    grenadeVal.textContent = playerGrenades;
}

// --- Tactical Hand Ordnance ---
function throwEquipmentGrenade() {
    if (playerGrenades <= 0) return; // Strict Capacity Enforcement Limit
    playerGrenades--;
    updateWeaponHUD();

    const grenade = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.09),
        new THREE.MeshStandardMaterial({ color: 0x3c6382, roughness: 0.8, metalness: 0.5 }) 
    );

    grenade.position.copy(camera.position).add(new THREE.Vector3(0, -0.2, 0));
    const aimVector = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    
    grenade.userData = {
        velocity: aimVector.multiplyScalar(19.0).add(new THREE.Vector3(0, 5.0, 0)), 
        fuse: 2.5
    };

    scene.add(grenade);
    activeGrenades.push(grenade);
}

function triggerGrenadeExplosion(positionVector) {
    playExplosionAudioFeedback();

    const radius = 15.0;
    bots.forEach(bot => {
        const distance = bot.position.distanceTo(positionVector);
        if (distance <= radius) {
            const fallingScalar = 1.0 - (distance / radius);
            bot.userData.health -= Math.floor(130 * fallingScalar);
            if (bot.userData.health <= 0) removeTargetBotUnit(bot);
        }
    });

    for (let i = 0; i < 45; i++) {
        const p = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.15, 0.15),
            new THREE.MeshBasicMaterial({ color: Math.random() > 0.3 ? 0xff6b6b : 0xfffa65, transparent: true, opacity: 1.0 })
        );
        p.position.copy(positionVector);
        p.userData = {
            velocity: new THREE.Vector3((Math.random() - 0.5) * 14, Math.random() * 12, (Math.random() - 0.5) * 14),
            life: 0.7
        };
        scene.add(p);
        explosionParticles.push(p);
    }
}

// --- Enemy Tactical Character Geometry Assemblers ---
function generateArmedAIModel() {
    const root = new THREE.Group();
    const clothing = new THREE.MeshStandardMaterial({ color: 0x57606f, roughness: 0.9 });
    const armor = new THREE.MeshStandardMaterial({ color: 0x2f3542, roughness: 0.7 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.3), clothing);
    torso.position.y = 1.15;
    root.add(torso);

    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.6, 0.34), armor);
    vest.position.y = 1.2;
    root.add(vest);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), armor);
    head.position.y = 1.75;
    root.add(head);

    const gunBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.4), armor);
    gunBarrel.rotateX(Math.PI / 2);
    gunBarrel.position.set(0.2, 1.1, -0.3);
    root.add(gunBarrel);

    return root;
}

function spawnRoundBots() {
    bots.forEach(b => scene.remove(b));
    bots = [];
    botsVal.textContent = currentRound;
    roundVal.textContent = currentRound;

    for (let i = 0; i < currentRound; i++) {
        const bot = generateArmedAIModel();
        bot.position.x = (Math.random() - 0.5) * 110;
        bot.position.y = 0;
        bot.position.z = -30 - (Math.random() * 60);
        bot.userData = { health: 100 };
        scene.add(bot);
        bots.push(bot);
    }
}

function removeTargetBotUnit(botTarget) {
    scene.remove(botTarget);
    bots = bots.filter(b => b !== botTarget);
    botsVal.textContent = bots.length;

    if (bots.length === 0) {
        currentRound++;
        playerGrenades = 1; // Replenish tactical inventory loadout capacity for next combat frame round
        setTimeout(() => { spawnRoundBots(); updateWeaponHUD(); }, 800);
    }
}

// --- Firing Core Engine Logic Routing ---
function executeSingleWeaponFireCycle() {
    const activeWep = WEAPONS[currentWeaponType];

    if (activeWep.ammo <= 0 || isReloading || playerHealth <= 0) {
        if (activeWep.ammo <= 0 && !isReloading) startReloadSequence();
        return;
    }

    // Set sidearm safety click flag architecture lock active
    if (!activeWep.isAutomatic) {
        hasFiredPistolThisClick = true;
    }

    activeWep.ammo--;
    updateWeaponHUD();

    playWeaponAudioFeedback(activeWep.audioFreq, false);
    
    const scaleFactor = isAimingADS ? 0.30 : 1.0;
    recoilRotation += activeWep.recoilRot * scaleFactor;
    recoilPosition += activeWep.recoilPos * scaleFactor;

    activeWep.muzzleFlash.material.opacity = 1.0;
    setTimeout(() => { activeWep.muzzleFlash.material.opacity = 0.0; }, 25);

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const targets = raycaster.intersectObjects(bots, true);

    if (targets.length > 0) {
        let actualBotRoot = targets[0].object.parent;
        while (actualBotRoot && !bots.includes(actualBotRoot)) actualBotRoot = actualBotRoot.parent;

        if (actualBotRoot) {
            actualBotRoot.userData.health -= activeWep.damage;
            
            actualBotRoot.traverse(node => {
                if (node.isMesh && node.material) {
                    node.userData.savedColor = node.material.color.getHex();
                    node.material.color.setHex(0xffffff); // White flash confirmation hit marker indicators
                }
            });

            setTimeout(() => {
                actualBotRoot.traverse(node => {
                    if (node.isMesh && node.material && node.userData.savedColor !== undefined) {
                        node.material.color.setHex(node.userData.savedColor);
                    }
                });
            }, 40);

            if (actualBotRoot.userData.health <= 0) {
                removeTargetBotUnit(actualBotRoot);
            }
        }
    }
}

function processAICombatLoops(delta) {
    botFireTimer += delta;
    if (botFireTimer < 0.75) return;
    botFireTimer = 0;

    bots.forEach(bot => {
        const distance = bot.position.distanceTo(camera.position);
        if (distance < 65 && playerHealth > 0) {
            
            // Audible indicator: play distinct AI gun feedback sound space
            playWeaponAudioFeedback(80, true);

            playerHealth -= 10;
            if (playerHealth < 0) playerHealth = 0;
            hpVal.textContent = playerHealth;

            damageOverlay.style.backgroundColor = "rgba(255, 75, 75, 0.45)";
            setTimeout(() => { damageOverlay.style.backgroundColor = "rgba(255, 75, 75, 0)"; }, 60);

            if (playerHealth <= 0) {
                executeDeploymentFailureReset();
            }
        }
    });
}

function executeDeploymentFailureReset() {
    document.exitPointerLock();
    gameOverMsg.style.display = "block";
    instructions.textContent = "REATTAIN PERSPECTIVE TO REDEPLOY";
    
    currentRound = 1;
    playerHealth = 100;
    playerGrenades = 1;
    hpVal.textContent = playerHealth;

    WEAPONS.PRIMARY.ammo = WEAPONS.PRIMARY.maxAmmo;
    WEAPONS.SECONDARY.ammo = WEAPONS.SECONDARY.maxAmmo;
    currentWeaponType = "PRIMARY";
    WEAPONS.PRIMARY.modelGroup.visible = true;
    WEAPONS.SECONDARY.modelGroup.visible = false;
    updateWeaponHUD();
    
    camera.position.set(0, 2, 0);
    cameraPitch = 0; cameraYaw = 0;
    camera.rotation.set(0,0,0);
    
    spawnRoundBots();
}

function startReloadSequence() {
    isReloading = true;
    isAimingADS = false;
    crosshairContainer.style.opacity = "1";
    reloadTimer = 0;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Master Frame Loop Processing Ecosystem ---
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (delta > 0.1) return; // Prevent temporal drift gaps

    const activeWep = WEAPONS[currentWeaponType];

    if (document.pointerLockElement === canvas && playerHealth > 0) {
        // WASD Tactical Coordinates Computing Vector Passes
        const rate = 14.0;
        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw).normalize();
        const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw).normalize();

        if (moveForward) camera.position.addScaledVector(forward, rate * delta);
        if (moveBackward) camera.position.addScaledVector(forward, -rate * delta);
        if (moveLeft) camera.position.addScaledVector(right, -rate * delta);
        if (moveRight) camera.position.addScaledVector(right, rate * delta);

        // Kinematic Velocity Physics Gravity Tracking Pass
        if (wantToJump && isGrounded) {
            playerHeightVelocity = jumpImpulseForce;
            isGrounded = false;
        }

        if (!isGrounded) {
            playerHeightVelocity -= gravityConstant * delta;
            camera.position.y += playerHeightVelocity * delta;

            if (camera.position.y <= 2.0) {
                camera.position.y = 2.0;
                playerHeightVelocity = 0;
                isGrounded = true;
            }
        }

        // Keep coordinates contained within strict map zones
        if (Math.abs(camera.position.x) > mapBoundary) camera.position.x = Math.sign(camera.position.x) * mapBoundary;
        if (Math.abs(camera.position.z) > mapBoundary) camera.position.z = Math.sign(camera.position.z) * mapBoundary;

        // Regulated Weapon Fire Clock Loop Tick Updates
        fireRateTimer += delta;
        if (isFiringTriggerHeld && !isReloading) {
            if (activeWep.isAutomatic) {
                if (fireRateTimer >= activeWep.fireRate) {
                    executeSingleWeaponFireCycle();
                    fireRateTimer = 0;
                }
            }
        } else {
            if (fireRateTimer > activeWep.fireRate) fireRateTimer = activeWep.fireRate;
        }

        // Equipment Grenade Mechanics Loop
        for (let i = activeGrenades.length - 1; i >= 0; i--) {
            const grenade = activeGrenades[i];
            grenade.userData.velocity.y -= gravityConstant * delta;
            grenade.position.addScaledVector(grenade.userData.velocity, delta);
            grenade.userData.fuse -= delta;

            if (grenade.position.y <= 0.1) {
                grenade.position.y = 0.1;
                grenade.userData.velocity.y *= -0.35; // Friction bounce calculation loss scale
                grenade.userData.velocity.x *= 0.7;
                grenade.userData.velocity.z *= 0.7;
            }

            if (grenade.userData.fuse <= 0) {
                triggerGrenadeExplosion(grenade.position);
                scene.remove(grenade);
                activeGrenades.splice(i, 1);
            }
        }

        // Simple Vector Enemy Line-of-Sight Chasing
        bots.forEach(bot => {
            const lookTarget = new THREE.Vector3().copy(camera.position);
            lookTarget.y = bot.position.y;
            bot.lookAt(lookTarget);
            
            const walkingVector = new THREE.Vector3(0, 0, 1).applyQuaternion(bot.quaternion);
            bot.position.addScaledVector(walkingVector, 4.2 * delta);
        });

        processAICombatLoops(delta);
    }

    // Explosion Particle Lifecycle Iteration
    for (let i = explosionParticles.length - 1; i >= 0; i--) {
        const p = explosionParticles[i];
        p.position.addScaledVector(p.userData.velocity, delta);
        p.userData.life -= delta;
        p.material.opacity = Math.max(0, p.userData.life / 0.7);
        if (p.userData.life <= 0) {
            scene.remove(p);
            explosionParticles.splice(i, 1);
        }
    }

    // Weapon Animation & Recoil Decay Engine Math Transformations
    const currentViewFOV = isAimingADS ? 40 : 65;
    camera.fov = THREE.MathUtils.lerp(camera.fov, currentViewFOV, 15.0 * delta);
    camera.updateProjectionMatrix();

    recoilRotation -= recoilRotation * 8.0 * delta;
    recoilPosition -= recoilPosition * 10.0 * delta;

    const chosenRestingPosition = isAimingADS ? activeWep.adsPos : activeWep.hipfirePos;
    const finalCalculatedWeaponPos = new THREE.Vector3().copy(chosenRestingPosition);
    
    finalCalculatedWeaponPos.y += recoilPosition * 0.4;
    finalCalculatedWeaponPos.z += recoilPosition;

    activeWep.modelGroup.position.lerp(finalCalculatedWeaponPos, 20.0 * delta);
    activeWep.modelGroup.rotation.x = THREE.MathUtils.lerp(activeWep.modelGroup.rotation.x, -recoilRotation * 0.35, 20.0 * delta);

    // Reload Mechanical Rotational Animation Matrices Interps
    if (isReloading) {
        reloadTimer += delta;
        if (reloadTimer < 0.4) {
            activeWep.modelGroup.rotation.z += 2.8 * delta;
            activeWep.modelGroup.position.y -= 0.5 * delta;
        } else if (reloadTimer < 0.8) {
            activeWep.modelGroup.rotation.z -= 2.8 * delta;
            activeWep.modelGroup.position.y += 0.5 * delta;
        } else {
            isReloading = false;
            activeWep.ammo = activeWep.maxAmmo;
            updateWeaponHUD();
        }
    }

    renderer.render(scene, camera);
}
