# Olè - The Lagos Hustle

A 3D endless runner game themed around Lagos, Nigeria, built with Three.js.

## Overview

**Olè** is a browser-based endless runner game where players control a masked character running through the busy streets of Lagos. The game features:

- **Lagos-themed environment**: Yellow danfo buses, colorful market stalls, buildings, and street vendors
- **Collectible items**: Money (naira notes/coins), phones, and Nigerian food items
- **Obstacles**: Tires, thorn strips, and hanging electric wires
- **3-lane movement system** with jump and slide mechanics
- **Scoring system** with high score persistence via localStorage

## Project Structure

```
/
├── index.html       # Main HTML file with game UI
├── style.css        # CSS styling for UI elements
├── script.js        # Main game logic (Three.js scene, player, items, etc.)
├── server.js        # Simple HTTP server for serving static files
└── replit.md        # This documentation file
```

## Controls

| Key | Action |
|-----|--------|
| ← / A | Move to left lane |
| → / D | Move to right lane |
| ↑ / W | Jump (over low obstacles) |
| ↓ / S | Slide (under wire obstacles) |

Mobile controls are also available on smaller screens.

## Game Mechanics

### Player Character
- Wears a colorful African mask with feathers
- Has a flowing cloak
- Auto-runs forward along the road
- Can move between 3 lanes

### Collectibles
- **Money (green notes/gold coins)**: +10 points
- **Phones (black rectangles)**: +20 points
- **Food (plates with rice/stew/plantain)**: +5 points

### Obstacles
- **Tires**: Jump over them
- **Thorns/spikes**: Jump over them
- **Electric wires**: Slide under them

### Health & Game Over
- Player starts with 3 hearts
- Hitting an obstacle removes 1 heart
- Game over when all hearts are lost

## Configuration

Game settings can be tweaked in `script.js` under `GAME_CONFIG`:

```javascript
const GAME_CONFIG = {
    lanes: [-3, 0, 3],           // Lane X positions
    initialSpeed: 0.3,            // Starting speed
    maxSpeed: 0.8,                // Maximum speed
    speedIncrement: 0.0001,       // Speed increase per frame
    jumpHeight: 3,                // Jump arc height
    jumpDuration: 0.5,            // Jump time in seconds
    slideDuration: 0.6,           // Slide time in seconds
    spawnDistance: 100,           // Distance ahead to spawn items
    despawnDistance: -20,         // Distance behind to remove items
    initialHealth: 3,             // Starting hearts
    itemScores: {
        money: 10,
        phone: 20,
        food: 5
    }
};
```

## Technical Details

- Uses Three.js r128 via CDN
- Uses requestAnimationFrame for smooth 60fps gameplay
- Implements infinite road recycling with segment pooling
- Box3 collision detection for player/item/obstacle interactions
- Responsive design with window resize handling

## Running the Game

The game runs on a Node.js HTTP server at port 5000:

```bash
node server.js
```

## Recent Changes

- December 4, 2025: Initial complete implementation of the Lagos-themed endless runner
