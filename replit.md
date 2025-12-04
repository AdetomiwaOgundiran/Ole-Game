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
├── game.js          # Main game logic (Three.js scene, player, items, etc.)
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

Game settings can be tweaked in `game.js` under `GAME_CONFIG`:

```javascript
const GAME_CONFIG = {
    lanes: [-3, 0, 3],           // Lane X positions
    initialSpeed: 0.2,            // Starting speed
    maxSpeed: 1.0,                // Maximum speed
    jumpHeight: 3,                // Jump arc height
    jumpDuration: 0.5,            // Jump time in seconds
    slideDuration: 0.6,           // Slide time in seconds
    spawnDistance: 60,            // Distance ahead to spawn items
    despawnDistance: -20,         // Distance behind to remove items
    initialHealth: 3,             // Starting hearts
    itemScores: {
        money: 10,
        phone: 20,
        food: 5
    }
};
```

## Progressive Difficulty System

The game features 9 difficulty levels that increase based on distance traveled:

| Level | Distance | Speed | Obstacle Chance | Max Obstacles | Collectible Chance |
|-------|----------|-------|-----------------|---------------|-------------------|
| 1 | 0 | 0.20 | 25% | 1 | 80% |
| 2 | 100 | 0.28 | 35% | 1 | 70% |
| 3 | 250 | 0.38 | 45% | 1 | 60% |
| 4 | 450 | 0.48 | 55% | 2 | 55% |
| 5 | 700 | 0.58 | 65% | 2 | 50% |
| 6 | 1000 | 0.68 | 75% | 2 | 45% |
| 7 | 1400 | 0.78 | 80% | 3 | 40% |
| 8 | 1900 | 0.88 | 85% | 3 | 35% |
| 9 | 2500 | 1.00 | 90% | 3 | 30% |

As you progress:
- Game speed increases noticeably at each tier
- More obstacles spawn per wave (up to 3 at highest levels)
- Collectibles become rarer, making each one more valuable

## Leaderboard System

The game includes a username and leaderboard system:
- **Username input**: Players must enter a name before starting the game
- **Score tracking**: Best scores are saved per username (only highest score kept)
- **Top 5 leaderboard**: Displays on both the menu and game over screens
- **Persistent storage**: Scores saved to `data/leaderboard.json`

### API Endpoints
- `GET /api/leaderboard` - Returns top 5 scores
- `POST /api/score` - Submit a score (body: `{username, score}`)

## Technical Details

- Uses Three.js r128 via CDN
- Uses requestAnimationFrame for smooth 60fps gameplay
- Implements infinite road recycling with segment pooling
- Box3 collision detection for player/item/obstacle interactions
- Responsive design with window resize handling
- JSON-based leaderboard persistence

## Running the Game

The game runs on a Node.js HTTP server at port 5000:

```bash
node server.js
```

## Lagos Atmosphere Features

The game includes enhanced visual elements for an authentic Lagos feel:
- **Palm trees** lining both sides of the road
- **Golden sun** with glow effect in the sky
- **Animated clouds** drifting across the horizon
- **Distant skyline buildings** with lit windows (Lagos at sunset)
- **Colorful billboards** (advertisements, phones, food, etc.)
- **Warm fog/haze** to simulate Lagos heat

## Recent Changes

- December 4, 2025: Added progressive difficulty system with 9 levels - speed and obstacles increase over distance
- December 4, 2025: Redesigned mobile controls to D-pad layout centered at bottom of screen
- December 4, 2025: Fixed environment reset bug - road segments and environment objects now properly reset on game restart
- December 4, 2025: Added initial item spawning (z=15-120) for immediate player engagement
- December 4, 2025: Reduced spawn distance from 100 to 60 for more frequent items
- December 4, 2025: Added username input and top 5 leaderboard system with persistent storage
- December 4, 2025: Added Lagos atmosphere elements - palm trees, sun, clouds, skyline, billboards
- December 4, 2025: Optimized skyline building window rendering for mobile performance
- December 4, 2025: Initial complete implementation of the Lagos-themed endless runner
