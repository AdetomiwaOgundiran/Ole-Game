const GAME_CONFIG = {
    lanes: [-3, 0, 3],
    initialSpeed: 0.2,
    maxSpeed: 1.0,
    jumpHeight: 3,
    jumpDuration: 0.5,
    slideDuration: 0.6,
    spawnDistance: 60,
    despawnDistance: -20,
    segmentLength: 50,
    numSegments: 5,
    initialHealth: 3,
    itemScores: {
        money: 10,
        phone: 20,
        food: 5
    },
    difficulty: {
        levels: [
            { distance: 0,    speed: 0.20, obstacleChance: 0.20, maxObstacles: 1, collectibleChance: 0.85 },
            { distance: 150,  speed: 0.26, obstacleChance: 0.25, maxObstacles: 1, collectibleChance: 0.8 },
            { distance: 350,  speed: 0.32, obstacleChance: 0.30, maxObstacles: 1, collectibleChance: 0.75 },
            { distance: 600,  speed: 0.40, obstacleChance: 0.40, maxObstacles: 1, collectibleChance: 0.7 },
            { distance: 900,  speed: 0.50, obstacleChance: 0.50, maxObstacles: 2, collectibleChance: 0.6 },
            { distance: 1300, speed: 0.60, obstacleChance: 0.55, maxObstacles: 2, collectibleChance: 0.55 },
            { distance: 1800, speed: 0.72, obstacleChance: 0.60, maxObstacles: 2, collectibleChance: 0.5 },
            { distance: 2400, speed: 0.85, obstacleChance: 0.70, maxObstacles: 2, collectibleChance: 0.45 },
            { distance: 3200, speed: 1.00, obstacleChance: 0.80, maxObstacles: 3, collectibleChance: 0.4 }
        ]
    }
};

let currentDifficultyLevel = 0;

let scene, camera, renderer, clock;
let player, playerBox;
let gameState = 'MENU';
let score = 0;
let bestScore = parseInt(localStorage.getItem('olebestScore')) || 0;
let health = GAME_CONFIG.initialHealth;
let currentLane = 1;
let targetLaneX = 0;
let isJumping = false;
let isSliding = false;
let jumpProgress = 0;
let slideProgress = 0;
let gameSpeed = GAME_CONFIG.initialSpeed;
let roadSegments = [];
let collectibles = [];
let obstacles = [];
let environmentObjects = [];
let lastSpawnZ = 0;

let menuScreen, hudElement, gameoverScreen, scoreElement, bestScoreElement;
let finalScoreElement, finalBestScoreElement, heartsContainer, mobileControls;
let usernameInput, startBtn, playerNameDisplay, leaderboardList, gameoverLeaderboardList;
let currentUsername = '';

let webglSupported = true;

function init() {
    console.log('Initializing game...');
    
    menuScreen = document.getElementById('menu-screen');
    hudElement = document.getElementById('hud');
    gameoverScreen = document.getElementById('gameover-screen');
    scoreElement = document.getElementById('score');
    bestScoreElement = document.getElementById('best-score');
    finalScoreElement = document.getElementById('final-score');
    finalBestScoreElement = document.getElementById('final-best-score');
    heartsContainer = document.getElementById('hearts');
    mobileControls = document.getElementById('mobile-controls');
    usernameInput = document.getElementById('username-input');
    startBtn = document.getElementById('start-btn');
    playerNameDisplay = document.getElementById('player-name');
    leaderboardList = document.getElementById('leaderboard-list');
    gameoverLeaderboardList = document.getElementById('gameover-leaderboard-list');
    
    const canvas = document.getElementById('game-canvas');
    
    fetchLeaderboard();
    
    setupEventListeners();
    
    try {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x7ec8e3);
        scene.fog = new THREE.Fog(0xc9a86c, 80, 200);
        
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 8, -12);
        camera.lookAt(0, 2, 20);
        
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        clock = new THREE.Clock();
        
        setupLights();
        createPlayer();
        createSkyBackground();
        createInitialEnvironment();
        
        if (bestScoreElement) bestScoreElement.textContent = bestScore;
        
        console.log('WebGL initialized successfully');
        
        animate();
    } catch (e) {
        console.error('WebGL initialization failed:', e);
        webglSupported = false;
        alert('WebGL initialization failed. Please make sure you are using a modern browser with WebGL support.');
    }
}

function setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1);
    sunLight.position.set(20, 50, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    scene.add(sunLight);
}

function createPlayer() {
    player = new THREE.Group();
    
    const bodyGeom = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 16);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x8b7355 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 1;
    body.castShadow = true;
    player.add(body);
    
    const headGeom = new THREE.SphereGeometry(0.45, 16, 16);
    const headMat = new THREE.MeshLambertMaterial({ color: 0x8b6914 });
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = 2.2;
    head.castShadow = true;
    player.add(head);
    
    const maskGeom = new THREE.BoxGeometry(0.5, 0.6, 0.2);
    const maskMat = new THREE.MeshLambertMaterial({ color: 0xff4500 });
    const mask = new THREE.Mesh(maskGeom, maskMat);
    mask.position.set(0, 2.2, 0.35);
    player.add(mask);
    
    const eyeGeom = new THREE.CircleGeometry(0.08, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.position.set(-0.12, 2.25, 0.46);
    player.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
    rightEye.position.set(0.12, 2.25, 0.46);
    player.add(rightEye);
    
    const featherGroup = new THREE.Group();
    const featherColors = [0x00bfff, 0x32cd32, 0xff6347];
    for (let i = 0; i < 3; i++) {
        const featherGeom = new THREE.ConeGeometry(0.08, 0.5, 4);
        const featherMat = new THREE.MeshLambertMaterial({ color: featherColors[i] });
        const feather = new THREE.Mesh(featherGeom, featherMat);
        feather.position.set((i - 1) * 0.15, 2.7 + Math.abs(i - 1) * 0.1, 0.1);
        feather.rotation.x = -0.3;
        featherGroup.add(feather);
    }
    player.add(featherGroup);
    
    const cloakGeom = new THREE.ConeGeometry(0.6, 1.5, 8, 1, true);
    const cloakMat = new THREE.MeshLambertMaterial({ color: 0xf5f5dc, side: THREE.DoubleSide });
    const cloak = new THREE.Mesh(cloakGeom, cloakMat);
    cloak.position.y = 0.8;
    cloak.rotation.x = Math.PI;
    player.add(cloak);
    
    player.position.set(0, 0, 0);
    scene.add(player);
    
    playerBox = new THREE.Box3();
}

function createRoadSegment(zPos) {
    const segment = new THREE.Group();
    
    const roadGeom = new THREE.PlaneGeometry(12, GAME_CONFIG.segmentLength);
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const road = new THREE.Mesh(roadGeom, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    segment.add(road);
    
    const lineGeom = new THREE.PlaneGeometry(0.15, GAME_CONFIG.segmentLength);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    for (let i = -1; i <= 1; i += 2) {
        const line = new THREE.Mesh(lineGeom, lineMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(i * 1.5, 0.01, 0);
        segment.add(line);
    }
    
    const sidewalkGeom = new THREE.BoxGeometry(4, 0.3, GAME_CONFIG.segmentLength);
    const sidewalkMat = new THREE.MeshLambertMaterial({ color: 0x999999 });
    for (let side = -1; side <= 1; side += 2) {
        const sidewalk = new THREE.Mesh(sidewalkGeom, sidewalkMat);
        sidewalk.position.set(side * 8, 0.15, 0);
        sidewalk.receiveShadow = true;
        segment.add(sidewalk);
    }
    
    segment.position.z = zPos;
    scene.add(segment);
    
    return segment;
}

function createMarketStall(x, z, color) {
    const stall = new THREE.Group();
    
    const tableGeom = new THREE.BoxGeometry(3, 0.8, 2);
    const tableMat = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    const table = new THREE.Mesh(tableGeom, tableMat);
    table.position.y = 0.4;
    table.castShadow = true;
    stall.add(table);
    
    const awningGeom = new THREE.BoxGeometry(3.5, 0.1, 2.5);
    const awningMat = new THREE.MeshLambertMaterial({ color: color });
    const awning = new THREE.Mesh(awningGeom, awningMat);
    awning.position.y = 2.5;
    awning.castShadow = true;
    stall.add(awning);
    
    const poleGeom = new THREE.CylinderGeometry(0.05, 0.05, 2.5, 8);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const positions = [[-1.4, 0, -0.9], [1.4, 0, -0.9], [-1.4, 0, 0.9], [1.4, 0, 0.9]];
    positions.forEach(pos => {
        const pole = new THREE.Mesh(poleGeom, poleMat);
        pole.position.set(pos[0], 1.25, pos[2]);
        stall.add(pole);
    });
    
    const goodsColors = [0xff6347, 0x32cd32, 0xffd700, 0xff69b4];
    for (let i = 0; i < 4; i++) {
        const goodGeom = new THREE.BoxGeometry(0.4, 0.3, 0.4);
        const goodMat = new THREE.MeshLambertMaterial({ color: goodsColors[i] });
        const good = new THREE.Mesh(goodGeom, goodMat);
        good.position.set(-0.9 + i * 0.6, 0.95, 0);
        stall.add(good);
    }
    
    stall.position.set(x, 0, z);
    return stall;
}

function createDanfo(x, z) {
    const bus = new THREE.Group();
    
    const bodyGeom = new THREE.BoxGeometry(2.5, 2, 5);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 1.5;
    body.castShadow = true;
    bus.add(body);
    
    const stripeGeom = new THREE.BoxGeometry(2.52, 0.3, 5.02);
    const stripeMat = new THREE.MeshLambertMaterial({ color: 0x1a1a8c });
    const stripe = new THREE.Mesh(stripeGeom, stripeMat);
    stripe.position.y = 1.8;
    bus.add(stripe);
    
    const windowGeom = new THREE.BoxGeometry(0.1, 0.6, 0.8);
    const windowMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    for (let i = 0; i < 4; i++) {
        const leftWindow = new THREE.Mesh(windowGeom, windowMat);
        leftWindow.position.set(-1.26, 2, -1.5 + i * 1.2);
        bus.add(leftWindow);
        const rightWindow = new THREE.Mesh(windowGeom, windowMat);
        rightWindow.position.set(1.26, 2, -1.5 + i * 1.2);
        bus.add(rightWindow);
    }
    
    const wheelGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const wheelPositions = [[-1.1, 0.4, -1.8], [1.1, 0.4, -1.8], [-1.1, 0.4, 1.8], [1.1, 0.4, 1.8]];
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeom, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(pos[0], pos[1], pos[2]);
        bus.add(wheel);
    });
    
    bus.position.set(x, 0, z);
    bus.rotation.y = x > 0 ? -0.1 : 0.1;
    return bus;
}

function createBuilding(x, z) {
    const building = new THREE.Group();
    
    const height = 4 + Math.random() * 6;
    const width = 3 + Math.random() * 3;
    const depth = 3 + Math.random() * 2;
    
    const colors = [0xcd853f, 0xdeb887, 0xf4a460, 0xd2691e, 0xa0522d];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const bodyGeom = new THREE.BoxGeometry(width, height, depth);
    const bodyMat = new THREE.MeshLambertMaterial({ color: color });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = height / 2;
    body.castShadow = true;
    building.add(body);
    
    const windowMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const numFloors = Math.floor(height / 2);
    for (let floor = 0; floor < numFloors; floor++) {
        const numWindows = Math.floor(width / 1.2);
        for (let w = 0; w < numWindows; w++) {
            const winGeom = new THREE.BoxGeometry(0.4, 0.5, 0.1);
            const win = new THREE.Mesh(winGeom, windowMat);
            win.position.set(-width / 2 + 0.8 + w * 1.1, 1 + floor * 2, depth / 2 + 0.05);
            building.add(win);
        }
    }
    
    building.position.set(x, 0, z);
    return building;
}

function createPalmTree(x, z) {
    const palm = new THREE.Group();
    
    const trunkGeom = new THREE.CylinderGeometry(0.15, 0.25, 4, 8);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.position.y = 2;
    palm.add(trunk);
    
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x228b22, side: THREE.DoubleSide });
    for (let i = 0; i < 7; i++) {
        const leafGeom = new THREE.PlaneGeometry(0.5, 2.5);
        const leaf = new THREE.Mesh(leafGeom, leafMat);
        leaf.position.y = 4;
        leaf.rotation.y = (i / 7) * Math.PI * 2;
        leaf.rotation.x = -0.5;
        palm.add(leaf);
    }
    
    palm.position.set(x, 0, z);
    palm.rotation.y = Math.random() * Math.PI * 2;
    palm.scale.setScalar(0.8 + Math.random() * 0.4);
    return palm;
}

function createBillboard(x, z) {
    const billboard = new THREE.Group();
    
    const poleGeom = new THREE.CylinderGeometry(0.1, 0.1, 5, 8);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const pole = new THREE.Mesh(poleGeom, poleMat);
    pole.position.y = 2.5;
    billboard.add(pole);
    
    const boardGeom = new THREE.BoxGeometry(4, 2, 0.2);
    const boardColors = [0xff6600, 0x00aa00, 0xffcc00, 0x0066cc, 0xff0066];
    const boardMat = new THREE.MeshLambertMaterial({ color: boardColors[Math.floor(Math.random() * boardColors.length)] });
    const board = new THREE.Mesh(boardGeom, boardMat);
    board.position.y = 6;
    billboard.add(board);
    
    const frameGeom = new THREE.BoxGeometry(4.2, 2.2, 0.1);
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const frame = new THREE.Mesh(frameGeom, frameMat);
    frame.position.set(0, 6, -0.1);
    billboard.add(frame);
    
    billboard.position.set(x, 0, z);
    billboard.rotation.y = x > 0 ? -0.3 : 0.3;
    return billboard;
}

function createSkylineBuilding(x, z) {
    const building = new THREE.Group();
    
    const height = 15 + Math.random() * 25;
    const width = 4 + Math.random() * 6;
    const depth = 4 + Math.random() * 4;
    
    const colors = [0x4a4a4a, 0x5a5a5a, 0x6a6a6a, 0x3a3a4a, 0x4a4a5a];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const bodyGeom = new THREE.BoxGeometry(width, height, depth);
    const bodyMat = new THREE.MeshLambertMaterial({ color: color });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = height / 2;
    building.add(body);
    
    const windowMat = new THREE.MeshBasicMaterial({ color: 0xffffaa, transparent: true, opacity: 0.6 });
    const numWindows = 2 + Math.floor(Math.random() * 3);
    for (let w = 0; w < numWindows; w++) {
        const winGeom = new THREE.BoxGeometry(0.8, height * 0.6, 0.1);
        const win = new THREE.Mesh(winGeom, windowMat);
        win.position.set(-width / 2 + 1 + w * (width / numWindows), height / 2, depth / 2 + 0.05);
        building.add(win);
    }
    
    building.position.set(x, 0, z);
    return building;
}

function createCloud(x, y, z) {
    const cloud = new THREE.Group();
    
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    
    const numPuffs = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numPuffs; i++) {
        const size = 1 + Math.random() * 2;
        const puffGeom = new THREE.SphereGeometry(size, 8, 8);
        const puff = new THREE.Mesh(puffGeom, cloudMat);
        puff.position.set(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 1,
            (Math.random() - 0.5) * 2
        );
        puff.scale.y = 0.6;
        cloud.add(puff);
    }
    
    cloud.position.set(x, y, z);
    cloud.userData.speed = 0.01 + Math.random() * 0.02;
    return cloud;
}

function createSun() {
    const sun = new THREE.Group();
    
    const sunGeom = new THREE.SphereGeometry(8, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffdd00 });
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    sun.add(sunMesh);
    
    const glowGeom = new THREE.SphereGeometry(12, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.3 });
    const glow = new THREE.Mesh(glowGeom, glowMat);
    sun.add(glow);
    
    sun.position.set(50, 60, 200);
    return sun;
}

let clouds = [];
let skylineBuildings = [];
let sunObject = null;

function createSkyBackground() {
    sunObject = createSun();
    scene.add(sunObject);
    
    for (let i = 0; i < 8; i++) {
        const cloud = createCloud(
            (Math.random() - 0.5) * 100,
            25 + Math.random() * 15,
            50 + Math.random() * 150
        );
        scene.add(cloud);
        clouds.push(cloud);
    }
    
    for (let i = 0; i < 15; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const building = createSkylineBuilding(
            side * (35 + Math.random() * 20),
            i * 30 + Math.random() * 20
        );
        scene.add(building);
        skylineBuildings.push(building);
    }
}

function updateSkyElements() {
    if (!player) return;
    
    clouds.forEach(cloud => {
        cloud.position.x += cloud.userData.speed;
        if (cloud.position.x > 60) {
            cloud.position.x = -60;
        }
    });
    
    if (sunObject) {
        sunObject.position.z = player.position.z + 200;
    }
    
    skylineBuildings.forEach(building => {
        if (building.position.z < player.position.z - 50) {
            building.position.z += 450;
        }
    });
}

function createTire(lane, z) {
    const tire = new THREE.Group();
    tire.userData = { type: 'obstacle', obstacleType: 'tire' };
    
    const torusGeom = new THREE.TorusGeometry(0.5, 0.25, 8, 16);
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const torus = new THREE.Mesh(torusGeom, tireMat);
    torus.rotation.x = Math.PI / 2;
    torus.position.y = 0.25;
    torus.castShadow = true;
    tire.add(torus);
    
    tire.position.set(GAME_CONFIG.lanes[lane], 0, z);
    return tire;
}

function createThorns(lane, z) {
    const thorns = new THREE.Group();
    thorns.userData = { type: 'obstacle', obstacleType: 'thorns' };
    
    const baseGeom = new THREE.BoxGeometry(1.5, 0.1, 1);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.position.y = 0.05;
    thorns.add(base);
    
    const spikeGeom = new THREE.ConeGeometry(0.08, 0.4, 6);
    const spikeMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
    for (let i = 0; i < 8; i++) {
        const spike = new THREE.Mesh(spikeGeom, spikeMat);
        spike.position.set(-0.5 + (i % 4) * 0.35, 0.25, -0.2 + Math.floor(i / 4) * 0.4);
        thorns.add(spike);
    }
    
    thorns.position.set(GAME_CONFIG.lanes[lane], 0, z);
    return thorns;
}

function createElectricWire(lane, z) {
    const wire = new THREE.Group();
    wire.userData = { type: 'obstacle', obstacleType: 'wire' };
    
    const poleGeom = new THREE.CylinderGeometry(0.08, 0.08, 4, 8);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
    
    const leftPole = new THREE.Mesh(poleGeom, poleMat);
    leftPole.position.set(-1.5, 2, 0);
    wire.add(leftPole);
    
    const rightPole = new THREE.Mesh(poleGeom, poleMat);
    rightPole.position.set(1.5, 2, 0);
    wire.add(rightPole);
    
    const wireGeom = new THREE.CylinderGeometry(0.03, 0.03, 3.2, 8);
    const wireMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    
    for (let i = 0; i < 3; i++) {
        const w = new THREE.Mesh(wireGeom, wireMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(0, 1.2 + i * 0.15, 0);
        wire.add(w);
    }
    
    wire.position.set(GAME_CONFIG.lanes[lane], 0, z);
    return wire;
}

function createMoney(lane, z) {
    const money = new THREE.Group();
    money.userData = { type: 'collectible', collectibleType: 'money', score: GAME_CONFIG.itemScores.money };
    
    const noteGeom = new THREE.BoxGeometry(0.8, 0.02, 0.4);
    const noteMat = new THREE.MeshLambertMaterial({ color: 0x228b22 });
    const note = new THREE.Mesh(noteGeom, noteMat);
    note.castShadow = true;
    money.add(note);
    
    const symbolGeom = new THREE.CircleGeometry(0.1, 8);
    const symbolMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const symbol = new THREE.Mesh(symbolGeom, symbolMat);
    symbol.position.set(0, 0.02, 0);
    symbol.rotation.x = -Math.PI / 2;
    money.add(symbol);
    
    money.position.set(GAME_CONFIG.lanes[lane], 1.2, z);
    return money;
}

function createPhone(lane, z) {
    const phone = new THREE.Group();
    phone.userData = { type: 'collectible', collectibleType: 'phone', score: GAME_CONFIG.itemScores.phone };
    
    const bodyGeom = new THREE.BoxGeometry(0.3, 0.6, 0.08);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.castShadow = true;
    phone.add(body);
    
    const screenGeom = new THREE.BoxGeometry(0.25, 0.45, 0.01);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x4169e1 });
    const screen = new THREE.Mesh(screenGeom, screenMat);
    screen.position.z = 0.045;
    phone.add(screen);
    
    phone.position.set(GAME_CONFIG.lanes[lane], 1.2, z);
    return phone;
}

function createFood(lane, z) {
    const food = new THREE.Group();
    food.userData = { type: 'collectible', collectibleType: 'food', score: GAME_CONFIG.itemScores.food };
    
    const plateGeom = new THREE.CylinderGeometry(0.4, 0.35, 0.08, 16);
    const plateMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const plate = new THREE.Mesh(plateGeom, plateMat);
    plate.castShadow = true;
    food.add(plate);
    
    const riceGeom = new THREE.SphereGeometry(0.25, 8, 8);
    const riceMat = new THREE.MeshLambertMaterial({ color: 0xfffacd });
    const rice = new THREE.Mesh(riceGeom, riceMat);
    rice.position.set(-0.1, 0.15, 0);
    rice.scale.y = 0.5;
    food.add(rice);
    
    const stewGeom = new THREE.SphereGeometry(0.2, 8, 8);
    const stewMat = new THREE.MeshLambertMaterial({ color: 0xff4500 });
    const stew = new THREE.Mesh(stewGeom, stewMat);
    stew.position.set(0.1, 0.12, 0.1);
    stew.scale.y = 0.4;
    food.add(stew);
    
    const plantainGeom = new THREE.CylinderGeometry(0.06, 0.08, 0.4, 8);
    const plantainMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
    const plantain = new THREE.Mesh(plantainGeom, plantainMat);
    plantain.position.set(0.15, 0.1, -0.15);
    plantain.rotation.z = Math.PI / 4;
    food.add(plantain);
    
    food.position.set(GAME_CONFIG.lanes[lane], 1.2, z);
    return food;
}

function createCoin(lane, z) {
    const coin = new THREE.Group();
    coin.userData = { type: 'collectible', collectibleType: 'money', score: GAME_CONFIG.itemScores.money };
    
    const coinGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.05, 16);
    const coinMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
    const coinMesh = new THREE.Mesh(coinGeom, coinMat);
    coinMesh.rotation.x = Math.PI / 2;
    coinMesh.castShadow = true;
    coin.add(coinMesh);
    
    coin.position.set(GAME_CONFIG.lanes[lane], 1.2, z);
    return coin;
}

function createInitialEnvironment() {
    for (let i = 0; i < GAME_CONFIG.numSegments; i++) {
        const z = i * GAME_CONFIG.segmentLength;
        const segment = createRoadSegment(z);
        roadSegments.push(segment);
        
        createEnvironmentForSegment(z);
    }
    
    lastSpawnZ = GAME_CONFIG.numSegments * GAME_CONFIG.segmentLength * 0.6;
}

function createEnvironmentForSegment(zPos) {
    const stallColors = [0xff6347, 0x4169e1, 0x32cd32, 0xff69b4, 0xffa500, 0x9370db];
    
    for (let i = 0; i < 3; i++) {
        const z = zPos - GAME_CONFIG.segmentLength / 2 + i * 15 + Math.random() * 5;
        
        if (Math.random() > 0.4) {
            const color = stallColors[Math.floor(Math.random() * stallColors.length)];
            const leftStall = createMarketStall(-11 - Math.random() * 2, z, color);
            scene.add(leftStall);
            environmentObjects.push(leftStall);
        }
        
        if (Math.random() > 0.4) {
            const color = stallColors[Math.floor(Math.random() * stallColors.length)];
            const rightStall = createMarketStall(11 + Math.random() * 2, z, color);
            scene.add(rightStall);
            environmentObjects.push(rightStall);
        }
    }
    
    if (Math.random() > 0.5) {
        const side = Math.random() > 0.5 ? 1 : -1;
        const danfo = createDanfo(side * (7 + Math.random() * 2), zPos + Math.random() * 20);
        scene.add(danfo);
        environmentObjects.push(danfo);
    }
    
    for (let i = 0; i < 2; i++) {
        const z = zPos - GAME_CONFIG.segmentLength / 2 + i * 25 + Math.random() * 10;
        
        if (Math.random() > 0.3) {
            const leftBuilding = createBuilding(-15 - Math.random() * 5, z);
            scene.add(leftBuilding);
            environmentObjects.push(leftBuilding);
        }
        
        if (Math.random() > 0.3) {
            const rightBuilding = createBuilding(15 + Math.random() * 5, z);
            scene.add(rightBuilding);
            environmentObjects.push(rightBuilding);
        }
    }
    
    for (let i = 0; i < 2; i++) {
        const z = zPos - GAME_CONFIG.segmentLength / 2 + i * 20 + Math.random() * 10;
        
        if (Math.random() > 0.5) {
            const leftPalm = createPalmTree(-10 - Math.random() * 2, z);
            scene.add(leftPalm);
            environmentObjects.push(leftPalm);
        }
        
        if (Math.random() > 0.5) {
            const rightPalm = createPalmTree(10 + Math.random() * 2, z);
            scene.add(rightPalm);
            environmentObjects.push(rightPalm);
        }
    }
    
    if (Math.random() > 0.7) {
        const side = Math.random() > 0.5 ? 1 : -1;
        const billboard = createBillboard(side * (12 + Math.random() * 3), zPos + Math.random() * 30);
        scene.add(billboard);
        environmentObjects.push(billboard);
    }
}

function getCurrentDifficulty() {
    const distance = player ? player.position.z : 0;
    const levels = GAME_CONFIG.difficulty.levels;
    
    let currentLevel = levels[0];
    for (let i = levels.length - 1; i >= 0; i--) {
        if (distance >= levels[i].distance) {
            currentLevel = levels[i];
            currentDifficultyLevel = i;
            break;
        }
    }
    
    return currentLevel;
}

function updateDifficulty() {
    const difficulty = getCurrentDifficulty();
    gameSpeed = difficulty.speed;
}

function spawnItems() {
    const spawnZ = player.position.z + GAME_CONFIG.spawnDistance;
    const difficulty = getCurrentDifficulty();
    
    const minSpawnGap = Math.max(12, 18 - currentDifficultyLevel);
    if (spawnZ - lastSpawnZ < minSpawnGap) return;
    
    lastSpawnZ = spawnZ;
    
    const occupiedLanes = [];
    
    const numObstacles = Math.random() < difficulty.obstacleChance ? 
        Math.floor(Math.random() * difficulty.maxObstacles) + 1 : 0;
    
    for (let o = 0; o < numObstacles; o++) {
        let lane;
        let attempts = 0;
        do {
            lane = Math.floor(Math.random() * 3);
            attempts++;
        } while (occupiedLanes.includes(lane) && attempts < 10);
        
        if (attempts >= 10) continue;
        
        occupiedLanes.push(lane);
        
        const obstacleType = Math.random();
        let obstacle;
        const offsetZ = spawnZ + o * 15;
        
        if (obstacleType < 0.4) {
            obstacle = createTire(lane, offsetZ);
        } else if (obstacleType < 0.7) {
            obstacle = createThorns(lane, offsetZ);
        } else {
            obstacle = createElectricWire(lane, offsetZ);
        }
        
        scene.add(obstacle);
        obstacles.push(obstacle);
    }
    
    if (Math.random() < difficulty.collectibleChance) {
        const maxCollectibles = Math.max(1, 3 - Math.floor(currentDifficultyLevel / 3));
        const numCollectibles = Math.floor(Math.random() * maxCollectibles) + 1;
        
        for (let i = 0; i < numCollectibles; i++) {
            let lane;
            let attempts = 0;
            do {
                lane = Math.floor(Math.random() * 3);
                attempts++;
            } while (occupiedLanes.includes(lane) && attempts < 10);
            
            if (attempts >= 10) continue;
            
            const offsetZ = spawnZ + i * 3 + (numObstacles > 0 ? 8 : 0);
            const itemType = Math.random();
            let collectible;
            
            if (itemType < 0.4) {
                collectible = Math.random() > 0.5 ? createMoney(lane, offsetZ) : createCoin(lane, offsetZ);
            } else if (itemType < 0.6) {
                collectible = createPhone(lane, offsetZ);
            } else {
                collectible = createFood(lane, offsetZ);
            }
            
            scene.add(collectible);
            collectibles.push(collectible);
        }
    }
}

function updateRoad() {
    roadSegments.forEach(segment => {
        if (segment.position.z < player.position.z + GAME_CONFIG.despawnDistance) {
            const newZ = segment.position.z + GAME_CONFIG.numSegments * GAME_CONFIG.segmentLength;
            segment.position.z = newZ;
            createEnvironmentForSegment(newZ);
        }
    });
    
    environmentObjects = environmentObjects.filter(obj => {
        if (obj.position.z < player.position.z + GAME_CONFIG.despawnDistance - 20) {
            scene.remove(obj);
            return false;
        }
        return true;
    });
}

function updatePlayer(delta) {
    player.position.z += gameSpeed;
    
    player.position.x += (targetLaneX - player.position.x) * 0.15;
    
    if (isJumping) {
        jumpProgress += delta / GAME_CONFIG.jumpDuration;
        if (jumpProgress >= 1) {
            jumpProgress = 0;
            isJumping = false;
            player.position.y = 0;
        } else {
            player.position.y = Math.sin(jumpProgress * Math.PI) * GAME_CONFIG.jumpHeight;
        }
    }
    
    if (isSliding) {
        slideProgress += delta / GAME_CONFIG.slideDuration;
        if (slideProgress >= 1) {
            slideProgress = 0;
            isSliding = false;
            player.scale.y = 1;
            player.position.y = 0;
        } else {
            player.scale.y = 0.4;
            player.position.y = -0.3;
        }
    }
    
    const time = clock.getElapsedTime();
    if (!isJumping && !isSliding) {
        player.position.y = Math.abs(Math.sin(time * 12)) * 0.15;
    }
    player.rotation.y = Math.sin(time * 8) * 0.05;
    
    camera.position.z = player.position.z - 12;
    camera.position.x = player.position.x * 0.3;
    camera.lookAt(player.position.x * 0.5, 2, player.position.z + 20);
    
    const playerMin = new THREE.Vector3(
        player.position.x - 0.4,
        player.position.y + (isSliding ? 0.5 : 0),
        player.position.z - 0.4
    );
    const playerMax = new THREE.Vector3(
        player.position.x + 0.4,
        player.position.y + (isSliding ? 1 : 2.5),
        player.position.z + 0.4
    );
    playerBox.set(playerMin, playerMax);
}

function checkCollisions() {
    collectibles = collectibles.filter(collectible => {
        const collectibleBox = new THREE.Box3().setFromObject(collectible);
        
        if (playerBox.intersectsBox(collectibleBox)) {
            score += collectible.userData.score;
            updateScore();
            
            createCollectionEffect(collectible.position.clone());
            
            scene.remove(collectible);
            return false;
        }
        
        if (collectible.position.z < player.position.z + GAME_CONFIG.despawnDistance) {
            scene.remove(collectible);
            return false;
        }
        
        collectible.rotation.y += 0.03;
        collectible.position.y = 1.2 + Math.sin(clock.getElapsedTime() * 3 + collectible.position.z) * 0.2;
        
        return true;
    });
    
    obstacles = obstacles.filter(obstacle => {
        const obstacleBox = new THREE.Box3().setFromObject(obstacle);
        
        if (playerBox.intersectsBox(obstacleBox)) {
            const obstacleType = obstacle.userData.obstacleType;
            
            if (obstacleType === 'wire' && isSliding) {
                return true;
            }
            
            if ((obstacleType === 'tire' || obstacleType === 'thorns') && isJumping) {
                return true;
            }
            
            takeDamage();
            scene.remove(obstacle);
            return false;
        }
        
        if (obstacle.position.z < player.position.z + GAME_CONFIG.despawnDistance) {
            scene.remove(obstacle);
            return false;
        }
        
        return true;
    });
}

function createCollectionEffect(position) {
    const particles = new THREE.Group();
    const colors = [0xffd700, 0x32cd32, 0xff6347];
    
    for (let i = 0; i < 8; i++) {
        const geom = new THREE.SphereGeometry(0.1, 8, 8);
        const mat = new THREE.MeshBasicMaterial({ 
            color: colors[Math.floor(Math.random() * colors.length)],
            transparent: true
        });
        const particle = new THREE.Mesh(geom, mat);
        particle.position.copy(position);
        particle.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.3,
            Math.random() * 0.3,
            (Math.random() - 0.5) * 0.3
        );
        particle.userData.life = 1;
        particles.add(particle);
    }
    
    scene.add(particles);
    
    const animateParticles = () => {
        let allDead = true;
        particles.children.forEach(p => {
            p.position.add(p.userData.velocity);
            p.userData.velocity.y -= 0.01;
            p.userData.life -= 0.05;
            p.material.opacity = p.userData.life;
            p.scale.setScalar(p.userData.life);
            if (p.userData.life > 0) allDead = false;
        });
        
        if (!allDead) {
            requestAnimationFrame(animateParticles);
        } else {
            scene.remove(particles);
        }
    };
    animateParticles();
}

function takeDamage() {
    health--;
    updateHearts();
    
    if (health <= 0) {
        gameOver();
    } else {
        player.traverse(child => {
            if (child.material) {
                const originalColor = child.material.color.getHex();
                child.material.color.setHex(0xff0000);
                setTimeout(() => {
                    child.material.color.setHex(originalColor);
                }, 200);
            }
        });
    }
}

function updateScore() {
    if (scoreElement) scoreElement.textContent = score;
    if (score > bestScore) {
        bestScore = score;
        if (bestScoreElement) bestScoreElement.textContent = bestScore;
        localStorage.setItem('olebestScore', bestScore);
    }
}

function updateHearts() {
    if (!heartsContainer) return;
    const hearts = heartsContainer.querySelectorAll('.heart');
    hearts.forEach((heart, index) => {
        if (index >= health) {
            heart.classList.add('lost');
        } else {
            heart.classList.remove('lost');
        }
    });
}

function moveLeft() {
    if (currentLane < 2 && gameState === 'PLAYING') {
        currentLane++;
        targetLaneX = GAME_CONFIG.lanes[currentLane];
    }
}

function moveRight() {
    if (currentLane > 0 && gameState === 'PLAYING') {
        currentLane--;
        targetLaneX = GAME_CONFIG.lanes[currentLane];
    }
}

function jump() {
    if (!isJumping && !isSliding && gameState === 'PLAYING') {
        isJumping = true;
        jumpProgress = 0;
    }
}

function slide() {
    if (!isSliding && !isJumping && gameState === 'PLAYING') {
        isSliding = true;
        slideProgress = 0;
    }
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const menuBtn = document.getElementById('menu-btn');
    
    if (startBtn) {
        startBtn.addEventListener('click', function(e) {
            console.log('Start button clicked');
            startGame();
        });
        console.log('Start button listener attached');
    }
    
    if (restartBtn) {
        restartBtn.addEventListener('click', function(e) {
            console.log('Restart button clicked');
            restartGame();
        });
    }
    
    if (menuBtn) {
        menuBtn.addEventListener('click', function(e) {
            console.log('Menu button clicked');
            showMenu();
        });
    }
    
    document.addEventListener('keydown', (e) => {
        console.log('Key pressed:', e.key, 'Game state:', gameState);
        
        // Don't process game keys when on menu (let user type username)
        if (gameState === 'MENU') {
            return;
        }
        
        // Restart game on any key press if game over
        if (gameState === 'GAMEOVER') {
            console.log('Restarting game from keypress');
            restartGame();
            return;
        }
        
        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                moveLeft();
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                moveRight();
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
                jump();
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                slide();
                break;
        }
    });
    
    const mobileLeft = document.getElementById('mobile-left');
    const mobileRight = document.getElementById('mobile-right');
    const mobileJump = document.getElementById('mobile-jump');
    const mobileSlide = document.getElementById('mobile-slide');
    
    const touchHandler = (action) => {
        return (e) => {
            e.preventDefault();
            e.stopPropagation();
            action();
        };
    };
    
    if (mobileLeft) {
        mobileLeft.addEventListener('touchstart', touchHandler(moveLeft), { passive: false });
        mobileLeft.addEventListener('click', moveLeft);
    }
    if (mobileRight) {
        mobileRight.addEventListener('touchstart', touchHandler(moveRight), { passive: false });
        mobileRight.addEventListener('click', moveRight);
    }
    if (mobileJump) {
        mobileJump.addEventListener('touchstart', touchHandler(jump), { passive: false });
        mobileJump.addEventListener('click', jump);
    }
    if (mobileSlide) {
        mobileSlide.addEventListener('touchstart', touchHandler(slide), { passive: false });
        mobileSlide.addEventListener('click', slide);
    }
    
    window.addEventListener('resize', onWindowResize);
    
    if (usernameInput) {
        usernameInput.addEventListener('input', () => {
            const username = usernameInput.value.trim();
            if (startBtn) {
                startBtn.disabled = username.length === 0;
            }
        });
        
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && usernameInput.value.trim().length > 0) {
                startGame();
            }
        });
    }
    
    console.log('Event listeners setup complete');
}

function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

function startGame() {
    console.log('startGame called');
    try {
        if (usernameInput) {
            currentUsername = usernameInput.value.trim();
            if (currentUsername.length === 0) {
                console.log('Username required');
                return;
            }
        }
        
        gameState = 'PLAYING';
        if (menuScreen) menuScreen.classList.add('hidden');
        if (hudElement) hudElement.classList.remove('hidden');
        if (mobileControls) mobileControls.classList.remove('hidden');
        
        if (playerNameDisplay) {
            playerNameDisplay.textContent = currentUsername;
        }
        
        resetGame();
        console.log('Game started successfully');
    } catch (e) {
        console.error('Error starting game:', e);
    }
}

function resetGame() {
    console.log('resetGame called');
    try {
        score = 0;
        health = GAME_CONFIG.initialHealth;
        gameSpeed = GAME_CONFIG.initialSpeed;
        currentDifficultyLevel = 0;
        currentLane = 1;
        targetLaneX = 0;
        isJumping = false;
        isSliding = false;
        
        if (player) {
            player.position.set(0, 0, 0);
        }
        if (camera) {
            camera.position.set(0, 8, -12);
        }
        
        if (scene) {
            collectibles.forEach(c => scene.remove(c));
            obstacles.forEach(o => scene.remove(o));
            environmentObjects.forEach(obj => scene.remove(obj));
        }
        collectibles = [];
        obstacles = [];
        environmentObjects = [];
        
        roadSegments.forEach((segment, i) => {
            segment.position.z = i * GAME_CONFIG.segmentLength;
        });
        
        for (let i = 0; i < GAME_CONFIG.numSegments; i++) {
            createEnvironmentForSegment(i * GAME_CONFIG.segmentLength);
        }
        
        lastSpawnZ = 0;
        
        spawnInitialItems();
        
        updateScore();
        updateHearts();
        console.log('resetGame complete');
    } catch (e) {
        console.error('Error in resetGame:', e);
    }
}

function spawnInitialItems() {
    for (let z = 15; z < 120; z += 12) {
        const lane = Math.floor(Math.random() * 3);
        
        if (Math.random() > 0.3) {
            const itemType = Math.random();
            let collectible;
            
            if (itemType < 0.5) {
                collectible = Math.random() > 0.5 ? createMoney(lane, z) : createCoin(lane, z);
            } else if (itemType < 0.7) {
                collectible = createPhone(lane, z);
            } else {
                collectible = createFood(lane, z);
            }
            
            scene.add(collectible);
            collectibles.push(collectible);
        }
        
        if (z > 30 && Math.random() > 0.6) {
            const obstacleLane = (lane + 1 + Math.floor(Math.random() * 2)) % 3;
            const obstacleType = Math.random();
            let obstacle;
            
            if (obstacleType < 0.4) {
                obstacle = createTire(obstacleLane, z + 5);
            } else if (obstacleType < 0.7) {
                obstacle = createThorns(obstacleLane, z + 5);
            } else {
                obstacle = createElectricWire(obstacleLane, z + 5);
            }
            
            scene.add(obstacle);
            obstacles.push(obstacle);
        }
    }
    
    lastSpawnZ = 120;
}

function gameOver() {
    gameState = 'GAMEOVER';
    
    finalScoreElement.textContent = score;
    finalBestScoreElement.textContent = bestScore;
    
    hudElement.classList.add('hidden');
    mobileControls.classList.add('hidden');
    gameoverScreen.classList.remove('hidden');
    
    fetchLeaderboard();
    submitScore(currentUsername, score);
}

function restartGame() {
    gameoverScreen.classList.add('hidden');
    hudElement.classList.remove('hidden');
    mobileControls.classList.remove('hidden');
    
    resetGame();
    gameState = 'PLAYING';
}

function showMenu() {
    gameoverScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
    gameState = 'MENU';
    fetchLeaderboard();
}

function fetchLeaderboard() {
    const timestamp = Date.now();
    fetch('/api/leaderboard?t=' + timestamp, {
        method: 'GET',
        cache: 'no-store',
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Leaderboard fetched:', data);
            if (data && data.leaderboard) {
                renderLeaderboard(data.leaderboard, leaderboardList);
                renderLeaderboard(data.leaderboard, gameoverLeaderboardList);
            }
        })
        .catch(error => {
            console.error('Error fetching leaderboard:', error);
            if (leaderboardList) {
                leaderboardList.innerHTML = '<p class="empty-text">Could not load leaderboard</p>';
            }
        });
}

function renderLeaderboard(leaderboard, container) {
    if (!container) return;
    
    if (!leaderboard || leaderboard.length === 0) {
        container.innerHTML = '<p class="empty-text">No scores yet. Be the first!</p>';
        return;
    }
    
    container.innerHTML = leaderboard.map((entry, index) => `
        <div class="leaderboard-entry${index === 0 ? ' first' : ''}">
            <span class="leaderboard-rank">${index + 1}.</span>
            <span class="leaderboard-name">${escapeHtml(entry.username)}</span>
            <span class="leaderboard-score">${entry.score}</span>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function submitScore(username, playerScore) {
    if (!username || username.length === 0) return;
    
    fetch('/api/score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            score: playerScore
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.leaderboard) {
            renderLeaderboard(data.leaderboard, leaderboardList);
            renderLeaderboard(data.leaderboard, gameoverLeaderboardList);
        }
    })
    .catch(error => {
        console.error('Error submitting score:', error);
    });
}

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    updateSkyElements();
    
    if (gameState === 'PLAYING') {
        updateDifficulty();
        
        updatePlayer(delta);
        updateRoad();
        spawnItems();
        checkCollisions();
    }
    
    renderer.render(scene, camera);
}

function safeInit() {
    console.log('Document ready, checking Three.js...');
    if (typeof THREE === 'undefined') {
        console.error('Three.js not loaded!');
        alert('Error: Three.js library failed to load. Please refresh the page.');
        return;
    }
    console.log('Three.js loaded, initializing game...');
    init();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInit);
} else {
    safeInit();
}
