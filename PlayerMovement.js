// --- Core Engine Setup ---
let scene, camera, renderer, clock;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false, wantToJump = false;

// --- Independent Camera Look Rotation Mechanics (PC Desktop Standards) ---
let cameraPitch = 0;   // Up / Down
let cameraYaw = 0;     // Left / Right

// --- Clean Jump & Vertical Physics Variables ---
let playerHeightVelocity = 0;
let isGrounded = true;
const gravityConstant = 32.0;
const jumpImpulseForce = 11.5;

// --- Gameplay States ---
let currentRound = 1;
let playerHealth = 100;
let isReloading = false;
let isAimingADS = false;
let bots = [];
let activeGrenades = [];
let explosionParticles = [];
const mapBoundary = 60;

// --- Automatic Firing & Input Tracking ---
let isFiringTriggerHeld = false;
let fireRateTimer = 0;

// --- Multi-Weapon Profile Structures ---
const WEAPONS = {
    PRIMARY: {
        name: "AK47",
        ammo: 30,
        maxAmmo: 30,
        fireRate: 0.11,     // Time between shots in seconds (~545 RPM)
        damage: 34,
        recoilRot: 0.14,
        recoilPos: 0.05,
        hipfirePos: new THREE.Vector3(0.18, -0.22, -0.42),
        adsPos: new THREE.Vector3(0.0, -0.145, -0.32),
        modelGroup: null,
        muzzleFlash: null,
        audioFreq: 280
    },
    SECONDARY: {
        name: "PISTOL",
        ammo: 15,
        maxAmmo: 15,
        fireRate: 0.18,     // Slower auto rate (~333 RPM)
        damage: 25,
        recoilRot: 0.09,
        recoilPos: 0.03,
        hipfirePos: new THREE.Vector3(0.14, -0.18, -0.35),
        adsPos: new THREE.Vector3(0.0, -0.125, -0.25),
        modelGroup: null,
        muzzleFlash: null,
        audioFreq: 380
    }
};
let currentWeaponType = "PRIMARY"; // Tracks whether PRIMARY or SECONDARY is drawn

// --- Audio Engine State ---
let audioCtx = null;

// --- Global Custom Material & Timers ---
let camoMaterial;
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
const maxAmmoVal = document.getElementById('max-ammo-val');
const weaponNameHUD = document.getElementById('weapon-name');
const damageOverlay = document.getElementById('damage-overlay');
const crosshair = document.getElementById('crosshair');
const canvas = document.getElementById('game-canvas');

// Runtime Initializer
init();
animate();

function init() {
    clock = new THREE.Clock();

    // 1. Scene Setup with Atmospheric Fog
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); 
    scene.fog = new THREE.FogExp2(0xccddee, 0.012);

    // 2. Realistic Daylight Systems
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.25);
    sunLight.position.set(40, 100, 20);
    scene.add(sunLight);

    // 3. Camera Setup - Standardized Rotation Hierarchy Tracking
    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.05, 1000);
    camera.rotation.order = "YXZ"; 
    camera.position.set(0, 2, 0); 

    // 4. Ground Map Setup
    const floorGeo = new THREE.PlaneGeometry(200, 200);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x445525, roughness: 0.95 }); 
    const floor = new THREE.Mesh(floorGeo, floorMat);
    scene.add(floor);

    // 5. Generate Environment Cover
    buildTownObstacles();

    // 6. Sky Dome
    const skyGeo = new THREE.SphereGeometry(400, 32, 15);
    const skyMat = new THREE.MeshBasicMaterial({ color: 0x87ceeb, side: THREE.BackSide });
    scene.add(new THREE.Mesh(skyGeo, skyMat));

    // 7. Damascus Laser-Etched Camo Shader
    camoMaterial = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0.0 } },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            float damascusNoise(vec2 p) {
                return sin(p.x * 12.0 + sin(p.y * 8.0)) * cos(p.y * 12.0 + cos(p.x * 8.0));
            }
            void main() {
                vec2 uvOffset = vUv * 3.5;
                float patternBase = damascusNoise(uvOffset + vec2(sin(time * 0.2), cos(time * 0.15)));
                vec3 baseMetal = mix(vec3(0.08, 0.09, 0.11), vec3(0.22, 0.24, 0.28), smoothstep(-1.0, 1.0, patternBase));
                float highVoltage = sin(vUv.x * 35.0 - time * 9.5) * cos(vUv.y * 25.0 + time * 6.0);
                float circuitLines = smoothstep(0.68, 0.76, highVoltage);
                vec3 energyCore = mix(vec3(0.0, 1.0, 0.25), vec3(0.0, 0.9, 1.0), sin(time * 3.0) * 0.5 + 0.5);
                vec3 viewDir = normalize(vViewPosition);
                float specFresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 4.0);
                vec3 finalSurface = mix(baseMetal, energyCore, circuitLines);
                finalSurface += (vec3(1.0) * specFresnel * 0.35) + (energyCore * circuitLines * 1.8);
                gl_FragColor = vec4(finalSurface, 1.0);
            }
        `
    });

    // 8. Model Weapon Assets (Both Primary & Secondary)
    buildDetailedAK47();
    buildDetailedPistol();

    // Sync baseline active visibility rules
    WEAPONS.PRIMARY.modelGroup.visible = true;
    WEAPONS.SECONDARY.modelGroup.visible = false;

    // 9. Deploy Initial Bot Wave
    spawnRoundBots();

    // 10. Renderer Setup
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 11. Input System Subscriptions
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
        if (e.button === 0) isFiringTriggerHeld = true;  // Hold Left Click down
        if (e.button === 2) toggleADS(true);              // Hold Right Click down
    });
    window.addEventListener('mouseup', (e) => {
        if (e.button === 0) isFiringTriggerHeld = false; // Release Left Click
        if (e.button === 2) toggleADS(false);             // Release Right Click
    });
    
    window.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('resize', onWindowResize);
    
    // Initial HUD text bind
    updateWeaponHUD();
}

// --- Audio Synthesizer Node Trees ---
function playWeaponAudioFeedback(frequencyValue) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(frequencyValue, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.1);
    oscGain.gain.setValueAtTime(0.7, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.11);

    const bufferSize = audioCtx.sampleRate * 0.1;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1400, now);
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.8, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    osc.connect(oscGain); oscGain.connect(audioCtx.destination);
    noiseSource.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(audioCtx.destination);
    osc.start(now); osc.stop(now + 0.12); noiseSource.start(now); noiseSource.stop(now + 0.12);
}

function playExplosionAudioFeedback() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(10, now + 0.6);
    oscGain.gain.setValueAtTime(1.5, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

    const bufferSize = audioCtx.sampleRate * 0.7;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const lowpass = audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(250, now);
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(1.8, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    osc.connect(oscGain); oscGain.connect(audioCtx.destination);
    noise.connect(lowpass); lowpass.connect(noiseGain); noiseGain.connect(audioCtx.destination);
    osc.start(now); osc.stop(now + 0.7); noise.start(now); noise.stop(now + 0.7);
}

// --- Procedural Generation Maps ---
function buildTownObstacles() {
    const houseMat = new THREE.MeshStandardMaterial({ color: 0x7c634e, roughness: 0.85 }); 
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b3a3a, roughness: 0.7 });  

    const housePositions = [
        {x: -25, z: -25}, {x: 25, z: -20}, {x: -15, z: 30}, {x: 35, z: 25},
        {x: 0, z: -45}, {x: -40, z: 5}, {x: 45, z: -40}, {x: 0, z: 45}
    ];

    housePositions.forEach(pos => {
        const houseGroup = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(11, 7, 13), houseMat);
        base.position.y = 3.5;
        houseGroup.add(base);

        const roofGeo = new THREE.ConeGeometry(9, 4, 4);
        roofGeo.rotateY(Math.PI / 4);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 9;
        roof.scale.set(1.4, 1, 1.6);
        houseGroup.add(roof);

        houseGroup.position.set(pos.x, 0, pos.z);
        scene.add(houseGroup);
    });
}

function buildDetailedAK47() {
    const group = new THREE.Group();
    
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.055, 0.3), camoMaterial);
    group.add(receiver);

    const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.033, 0.045, 0.18), camoMaterial);
    handguard.position.set(0, -0.005, -0.2);
    group.add(handguard);

    const barrelGeo = new THREE.CylinderGeometry(0.007, 0.009, 0.3);
    barrelGeo.rotateX(Math.PI / 2);
    const barrel = new THREE.Mesh(barrelGeo, new THREE.MeshStandardMaterial({color: 0x161616, roughness: 0.4}));
    barrel.position.set(0, 0.01, -0.34);
    group.add(barrel);

    const magGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
        const segment = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.042, 0.065), new THREE.MeshStandardMaterial({color: 0x111113}));
        segment.position.set(0, -0.07 - (i * 0.032), -0.04 - (i * 0.01));
        segment.rotation.x = 0.15 + (i * 0.08);
        magGroup.add(segment);
    }
    group.add(magGroup);

    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.09, 0.038), new THREE.MeshStandardMaterial({color: 0x111111}));
    grip.position.set(0, -0.065, 0.07);
    grip.rotation.x = -0.35;
    group.add(grip);

    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.065, 0.16), camoMaterial);
    stock.position.set(0, -0.01, 0.21);
    group.add(stock);

    const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.035, 0.008), new THREE.MeshStandardMaterial({color: 0x161616}));
    frontSight.position.set(0, 0.036, -0.44);
    group.add(frontSight);

    group.position.copy(WEAPONS.PRIMARY.hipfirePos);
    camera.add(group);
    scene.add(camera);

    const flashGeo = new THREE.ConeGeometry(0.04, 0.14, 6);
    flashGeo.rotateX(-Math.PI / 2);
    const flashMesh = new THREE.Mesh(flashGeo, new THREE.MeshBasicMaterial({ color: 0xffdd44, transparent: true, opacity: 0 }));
    flashMesh.position.set(0, 0.01, -0.5);
    group.add(flashMesh);

    WEAPONS.PRIMARY.modelGroup = group;
    WEAPONS.PRIMARY.muzzleFlash = flashMesh;
}

function buildDetailedPistol() {
    const group = new THREE.Group();

    // Slide and frame wrapped in premium Damascus camo finish
    const slide = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.035, 0.18), camoMaterial);
    slide.position.set(0, 0.02, -0.02);
    group.add(slide);

    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.02, 0.14), camoMaterial);
    frame.position.set(0, 0.0, -0.03);
    group.add(frame);

    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.075, 0.032), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 }));
    grip.position.set(0, -0.04, 0.02);
    grip.rotation.x = -0.22;
    group.add(grip);

    const barrelGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.06);
    barrelGeo.rotateX(Math.PI / 2);
    const barrel = new THREE.Mesh(barrelGeo, new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 }));
    barrel.position.set(0, 0.02, -0.12);
    group.add(barrel);

    group.position.copy(WEAPONS.SECONDARY.hipfirePos);
    camera.add(group);

    const flashGeo = new THREE.ConeGeometry(0.03, 0.1, 5);
    flashGeo.rotateX(-Math.PI / 2);
    const flashMesh = new THREE.Mesh(flashGeo, new THREE.MeshBasicMaterial({ color: 0xffcc33, transparent: true, opacity: 0 }));
    flashMesh.position.set(0, 0.02, -0.16);
    group.add(flashMesh);

    WEAPONS.SECONDARY.modelGroup = group;
    WEAPONS.SECONDARY.muzzleFlash = flashMesh;
}

// --- Key Management ---
function handleKeyToggle(code, isPressed) {
    switch (code) {
        case 'KeyW': moveForward = isPressed; break;
        case 'KeyS': moveBackward = isPressed; break;
        case 'KeyA': moveLeft = isPressed; break;
        case 'KeyD': moveRight = isPressed; break;
        case 'Space': wantToJump = isPressed; break;
        case 'KeyG': if (isPressed && playerHealth > 0) initiateGrenadeToss(); break;
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
    crosshair.style.opacity = isAimingADS ? "0" : "1"; 
}

function swapActiveWeaponLoadout() {
    isFiringTriggerHeld = false; // Disengage trigger safety thresholds during swap window
    
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
}

// --- Combat Equipment Mechanics ---
function initiateGrenadeToss() {
    const grenade = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x2e401a, roughness: 0.8, metalness: 0.7 }) 
    );

    grenade.position.copy(camera.position).add(new THREE.Vector3(0, -0.2, 0));
    
    const launchDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const throwStrength = 17.5;
    
    grenade.userData = {
        velocity: launchDirection.multiplyScalar(throwStrength).add(new THREE.Vector3(0, 4.5, 0)), 
        fuseTime: 2.2
    };

    scene.add(grenade);
    activeGrenades.push(grenade);
}

function triggerGrenadeExplosion(positionVector) {
    playExplosionAudioFeedback();

    const explosionBlastRadius = 14.0;
    bots.forEach(bot => {
        const distance = bot.position.distanceTo(positionVector);
        if (distance <= explosionBlastRadius) {
            const damageReductionMultiplier = 1.0 - (distance / explosionBlastRadius);
            bot.userData.health -= Math.floor(120 * damageReductionMultiplier); 
            
            if (bot.userData.health <= 0) {
                clearSingleBotUnit(bot);
            }
        }
    });

    for (let i = 0; i < 40; i++) {
        const particle = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.12 + Math.random() * 0.15),
            new THREE.MeshBasicMaterial({ color: Math.random() > 0.4 ? 0xff5500 : 0xcc3300, transparent: true, opacity: 1.0 })
        );
        particle.position.copy(positionVector);
        particle.userData = {
            velocity: new THREE.Vector3((Math.random() - 0.5) * 12, (Math.random()) * 10, (Math.random() - 0.5) * 12),
            life: 0.65
        };
        scene.add(particle);
        explosionParticles.push(particle);
    }
}

// --- Rigorous Tactical Military Unit Modeling ---
function createArmedMilitarySoldier() {
    const soldierGroup = new THREE.Group();

    const camoPatternMat = new THREE.MeshStandardMaterial({ color: 0xc2a678, roughness: 0.85 }); 
    const tacticalVestMat = new THREE.MeshStandardMaterial({ color: 0x4a4235, roughness: 0.75 });  
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, metalness: 0.8, roughness: 0.3 });

    const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.3), metalMat);
    leftBoot.position.set(-0.2, 0.08, 0.05);
    const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.3), metalMat);
    rightBoot.position.set(0.2, 0.08, 0.05);
    soldierGroup.add(leftBoot, rightBoot);

    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.8), camoPatternMat);
    leftLeg.position.set(-0.2, 0.5, 0);
    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.8), camoPatternMat);
    rightLeg.position.set(0.2, 0.5, 0);
    soldierGroup.add(leftLeg, rightLeg);

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.22, 0.95), camoPatternMat);
    torso.position.set(0, 1.3, 0);
    soldierGroup.add(torso);

    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.62, 0.38), tacticalVestMat);
    vest.position.set(0, 1.32, 0);
    soldierGroup.add(vest);

    const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.2, 0.08), tacticalVestMat);
    pouch.position.set(0, 1.15, 0.2);
    soldierGroup.add(pouch);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 16), tacticalVestMat);
    head.position.set(0, 1.88, 0);
    soldierGroup.add(head);

    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), camoPatternMat);
    helmet.position.set(0, 1.92, 0);
    soldierGroup.add(helmet);

    const weaponRig = new THREE.Group();
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.45), metalMat);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.35), metalMat);
    barrel.rotateX(Math.PI / 2);
    barrel.position.set(0, 0.005, -0.35);
    const curvedMag = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.16, 0.05), metalMat);
    curvedMag.position.set(0, -0.09, -0.08);
    curvedMag.rotation.x = 0.2;

    weaponRig.add(receiver, barrel, curvedMag);
    weaponRig.position.set(0.22, 1.25, -0.2);
    weaponRig.rotation.x = -0.05; 
    soldierGroup.add(weaponRig);

    return soldierGroup;
}

function spawnRoundBots() {
    bots.forEach(bot => scene.remove(bot));
    bots = [];
    botsVal.textContent = currentRound;
    roundVal.textContent = currentRound;

    for (let i = 0; i < currentRound; i++) {
        const bot = createArmedMilitarySoldier();
        bot.position.x = (Math.random() - 0.5) * 85;
        bot.position.y = 0;
        bot.position.z = -25 - (Math.random() * 45);
        bot.userData = { health: 100 };
        scene.add(bot);
        bots.push(bot);
    }
}

function clearSingleBotUnit(botTarget) {
    scene.remove(botTarget);
    bots = bots.filter(b => b !== botTarget);
    botsVal.textContent = bots.length;

    if (bots.length === 0) {
        currentRound++;
        setTimeout(() => { spawnRoundBots(); }, 800);
    }
}

// --- Full Automatic Firing Loop Execution ---
function executeAutomaticWeaponFire() {
    const activeWep = WEAPONS[currentWeaponType];

    if (activeWep.ammo <= 0 || isReloading || playerHealth <= 0) {
        if (activeWep.ammo <= 0 && !isReloading) startReloadSequence();
        return;
    }

    activeWep.ammo--;
    updateWeaponHUD();

    playWeaponAudioFeedback(activeWep.audioFreq);
    
    const recoilModifier = isAimingADS ? 0.35 : 1.0;
    recoilRotation += activeWep.recoilRot * recoilModifier;
    recoilPosition += activeWep.recoilPos * recoilModifier;

    activeWep.muzzleFlash.material.opacity = 1.0;
    setTimeout(() => { activeWep.muzzleFlash.material.opacity = 0.0; }, 30);

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(bots, true);

    if (intersects.length > 0) {
        let rootBot = intersects[0].object.parent;
        while (rootBot && !bots.includes(rootBot)) rootBot = rootBot.parent;

        if (rootBot) {
            rootBot.userData.health -= activeWep.damage;
            
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
                clearSingleBotUnit(rootBot);
            }
        }
    }
}

function handleAICombatCycle(delta) {
    botFireTimer += delta;
    if (botFireTimer < 0.65) return;
    botFireTimer = 0;

    bots.forEach(bot => {
        const distance = bot.position.distanceTo(camera.position);
        if (distance < 55 && playerHealth > 0) {
            playerHealth -= 8;
            if (playerHealth < 0) playerHealth = 0;
            hpVal.textContent = playerHealth;

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
    
    currentRound = 1;
    playerHealth = 100;
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
    crosshair.style.opacity = "1";
    reloadTimer = 0;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Main Engine Physics Loop ---
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (delta > 0.1) return; 
    
    camoMaterial.uniforms.time.value += delta;

    const activeWep = WEAPONS[currentWeaponType];

    if (document.pointerLockElement === canvas && playerHealth > 0) {
        // 1. SNAPPY DESKTOP FPS MOVEMENT
        const movementSpeed = 13.5;
        const forwardMoveVector = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw).normalize();
        const rightMoveVector = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw).normalize();

        if (moveForward) camera.position.addScaledVector(forwardMoveVector, movementSpeed * delta);
        if (moveBackward) camera.position.addScaledVector(forwardMoveVector, -movementSpeed * delta);
        if (moveLeft) camera.position.addScaledVector(rightMoveVector, -movementSpeed * delta);
        if (moveRight) camera.position.addScaledVector(rightMoveVector, movementSpeed * delta);

        // 2. Vertical Jump & Gravity Engine
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

        // Map Boundary Hard Locks
        if (Math.abs(camera.position.x) > mapBoundary) camera.position.x = Math.sign(camera.position.x) * mapBoundary;
        if (Math.abs(camera.position.z) > mapBoundary) camera.position.z = Math.sign(camera.position.z) * mapBoundary;

        // 3. Continuous Firing Clock Cycle
        fireRateTimer += delta;
        if (isFiringTriggerHeld && !isReloading) {
            if (fireRateTimer >= activeWep.fireRate) {
                executeAutomaticWeaponFire();
                fireRateTimer = 0; // Reset rate threshold
            }
        } else {
            // Keep timer primed when not actively spraying
            if (fireRateTimer > activeWep.fireRate) fireRateTimer = activeWep.fireRate;
        }

        // 4. Equipment Grenade Mechanics
        for (let i = activeGrenades.length - 1; i >= 0; i--) {
            const grenade = activeGrenades[i];
            grenade.userData.velocity.y -= gravityConstant * delta; 
            grenade.position.addScaledVector(grenade.userData.velocity, delta);
            grenade.userData.fuseTime -= delta;

            if (grenade.position.y <= 0.09) {
                grenade.position.y = 0.09;
                grenade.userData.velocity.y *= -0.38; 
                grenade.userData.velocity.x *= 0.6;
                grenade.userData.velocity.z *= 0.6;
            }

            if (grenade.userData.fuseTime <= 0) {
                triggerGrenadeExplosion(grenade.position);
                scene.remove(grenade);
                activeGrenades.splice(i, 1);
            }
        }

        // 5. Enemy AI Tracking Routing
        bots.forEach(bot => {
            const targetPos = new THREE.Vector3().copy(camera.position);
            targetPos.y = bot.position.y;
            bot.lookAt(targetPos);
            
            const step = new THREE.Vector3(0, 0, 1).applyQuaternion(bot.quaternion);
            bot.position.addScaledVector(step, 3.8 * delta);
        });

        handleAICombatCycle(delta);
    }

    // Blast Ring Smoke/Fire Particles Degradation
    for (let i = explosionParticles.length - 1; i >= 0; i--) {
        const p = explosionParticles[i];
        p.position.addScaledVector(p.userData.velocity, delta);
        p.userData.life -= delta;
        p.material.opacity = Math.max(0, p.userData.life / 0.65);
        if (p.userData.life <= 0) {
            scene.remove(p);
            explosionParticles.splice(i, 1);
        }
    }

    // 6. Smooth Weapon Camera View Target Interpolations
    const targetWeaponPos = isAimingADS ? activeWep.adsPos : activeWep.hipfirePos;
    const currentFOV = isAimingADS ? 42 : 65; 
    
    camera.fov = THREE.MathUtils.lerp(camera.fov, currentFOV, 16.0 * delta);
    camera.updateProjectionMatrix();

    recoilRotation -= recoilRotation * 9.0 * delta;
    recoilPosition -= recoilPosition * 12.0 * delta;
    
    const finalWeaponOffset = new THREE.Vector3().copy(targetWeaponPos);
    finalWeaponOffset.y += recoilPosition * 0.35;
    finalWeaponOffset.z += recoilPosition;
    
    activeWep.modelGroup.position.lerp(finalWeaponOffset, 22.0 * delta);
    activeWep.modelGroup.rotation.x = THREE.MathUtils.lerp(activeWep.modelGroup.rotation.x, -recoilRotation * 0.3, 22.0 * delta);

    // Reload Stance Transformation
    if (isReloading) {
        reloadTimer += delta;
        if (reloadTimer < 0.4) {
            activeWep.modelGroup.rotation.z += 2.5 * delta;
            activeWep.modelGroup.position.y -= 0.6 * delta;
        } else if (reloadTimer < 0.8) {
            activeWep.modelGroup.rotation.z -= 2.5 * delta;
            activeWep.modelGroup.position.y += 0.6 * delta;
        } else {
            isReloading = false;
            activeWep.ammo = activeWep.maxAmmo;
            updateWeaponHUD();
        }
    }

    renderer.render(scene, camera);
}
