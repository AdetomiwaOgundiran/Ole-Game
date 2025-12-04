const GAME_CONFIG = {
    lanes: [-3, 0, 3],
    initialSpeed: 0.3,
    maxSpeed: 0.8,
    speedIncrement: 0.0001,
    jumpHeight: 3,
    jumpDuration: 0.5,
    slideDuration: 0.6,
    spawnDistance: 100,
    despawnDistance: -20,
    segmentLength: 50,
    numSegments: 5,
    initialHealth: 3,
    itemScores: {
        money: 10,
        phone: 20,
        food: 5
    }
};

let scene, camera, renderer, clock;
let player, playerBox;
let gameState = 'MENU';
let score = 0;
let bestScore = localStorage.getItem('olebestScore') || 0;
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

const menuScreen = document.getElementById('menu-screen');
const hudElement = document.getElementById('hud');
const gameoverScreen = document.getElementById('gameover-screen');
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('best-score');
const finalScoreElement = document.getElementById('final-score');
const finalBestScoreElement = document.getElementById('final-best-score');
const heartsContainer = document.getElementById('hearts');
const mobileControls = document.getElementById('mobile-controls');

function init() {
    const canvas = document.getElementById('game-canvas');
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 50, 150);
    
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
    createInitialEnvironment();
    
    bestScoreElement.textContent = bestScore;
    
    setupEventListeners();
    
    animate();
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
    
    const bodyGeom = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16);
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
}

function spawnItems() {
    const spawnZ = player.position.z + GAME_CONFIG.spawnDistance;
    
    if (spawnZ - lastSpawnZ < 8) return;
    
    lastSpawnZ = spawnZ;
    
    const occupiedLanes = [];
    
    if (Math.random() > 0.4) {
        const lane = Math.floor(Math.random() * 3);
        occupiedLanes.push(lane);
        
        const obstacleType = Math.random();
        let obstacle;
        
        if (obstacleType < 0.4) {
            obstacle = createTire(lane, spawnZ);
        } else if (obstacleType < 0.7) {
            obstacle = createThorns(lane, spawnZ);
        } else {
            obstacle = createElectricWire(lane, spawnZ);
        }
        
        scene.add(obstacle);
        obstacles.push(obstacle);
    }
    
    const numCollectibles = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numCollectibles; i++) {
        let lane;
        let attempts = 0;
        do {
            lane = Math.floor(Math.random() * 3);
            attempts++;
        } while (occupiedLanes.includes(lane) && attempts < 10);
        
        if (attempts >= 10) continue;
        
        const offsetZ = spawnZ + i * 3;
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
    scoreElement.textContent = score;
    if (score > bestScore) {
        bestScore = score;
        bestScoreElement.textContent = bestScore;
        localStorage.setItem('olebestScore', bestScore);
    }
}

function updateHearts() {
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
    if (currentLane > 0 && gameState === 'PLAYING') {
        currentLane--;
        targetLaneX = GAME_CONFIG.lanes[currentLane];
    }
}

function moveRight() {
    if (currentLane < 2 && gameState === 'PLAYING') {
        currentLane++;
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
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('menu-btn').addEventListener('click', showMenu);
    
    document.addEventListener('keydown', (e) => {
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
    
    document.getElementById('mobile-left').addEventListener('touchstart', (e) => { e.preventDefault(); moveLeft(); });
    document.getElementById('mobile-right').addEventListener('touchstart', (e) => { e.preventDefault(); moveRight(); });
    document.getElementById('mobile-jump').addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });
    document.getElementById('mobile-slide').addEventListener('touchstart', (e) => { e.preventDefault(); slide(); });
    
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function startGame() {
    gameState = 'PLAYING';
    menuScreen.classList.add('hidden');
    hudElement.classList.remove('hidden');
    mobileControls.classList.remove('hidden');
    
    resetGame();
}

function resetGame() {
    score = 0;
    health = GAME_CONFIG.initialHealth;
    gameSpeed = GAME_CONFIG.initialSpeed;
    currentLane = 1;
    targetLaneX = 0;
    isJumping = false;
    isSliding = false;
    
    player.position.set(0, 0, 0);
    camera.position.set(0, 8, -12);
    
    collectibles.forEach(c => scene.remove(c));
    collectibles = [];
    
    obstacles.forEach(o => scene.remove(o));
    obstacles = [];
    
    lastSpawnZ = GAME_CONFIG.spawnDistance;
    
    updateScore();
    updateHearts();
}

function gameOver() {
    gameState = 'GAMEOVER';
    
    finalScoreElement.textContent = score;
    finalBestScoreElement.textContent = bestScore;
    
    hudElement.classList.add('hidden');
    mobileControls.classList.add('hidden');
    gameoverScreen.classList.remove('hidden');
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
}

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    if (gameState === 'PLAYING') {
        gameSpeed = Math.min(gameSpeed + GAME_CONFIG.speedIncrement, GAME_CONFIG.maxSpeed);
        
        updatePlayer(delta);
        updateRoad();
        spawnItems();
        checkCollisions();
    }
    
    renderer.render(scene, camera);
}

init();
