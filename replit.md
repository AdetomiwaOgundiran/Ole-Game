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

The game features 9 difficulty levels that increase based on distance traveled with smoother progression:

| Level | Distance | Speed | Obstacle Chance | Max Obstacles | Collectible Chance |
|-------|----------|-------|-----------------|---------------|-------------------|
| 1 | 0 | 0.20 | 20% | 1 | 85% |
| 2 | 150 | 0.26 | 25% | 1 | 80% |
| 3 | 350 | 0.32 | 30% | 1 | 75% |
| 4 | 600 | 0.40 | 40% | 1 | 70% |
| 5 | 900 | 0.50 | 50% | 2 | 60% |
| 6 | 1300 | 0.60 | 55% | 2 | 55% |
| 7 | 1800 | 0.72 | 60% | 2 | 50% |
| 8 | 2400 | 0.85 | 70% | 2 | 45% |
| 9 | 3200 | 1.00 | 80% | 3 | 40% |

As you progress:
- Game speed increases gradually at each tier
- Obstacles spawn with 15-unit spacing between them to allow reaction time
- Multiple obstacles (2-3) only appear at very high levels
- Collectibles remain plentiful for a more rewarding experience

## Randomness

Every playthrough is completely random:
- Lane positions for obstacles/collectibles are randomly chosen
- Obstacle types (tires, thorns, wires) are randomly selected
- Spawn timing varies within allowed gaps
- No two runs are ever identical

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

- December 4, 2025: Rebalanced difficulty - reduced obstacle clustering, smoother progression curve, max 2 obstacles until very late game
- December 4, 2025: Improved leaderboard caching - added cache-busting to ensure fresh data on start screen
- December 4, 2025: Added progressive difficulty system with 9 levels - speed and obstacles increase over distance
- December 4, 2025: Redesigned mobile controls to D-pad layout centered at bottom of screen
- December 4, 2025: Fixed environment reset bug - road segments and environment objects now properly reset on game restart
- December 4, 2025: Added initial item spawning (z=15-120) for immediate player engagement
- December 4, 2025: Reduced spawn distance from 100 to 60 for more frequent items
- December 4, 2025: Added username input and top 5 leaderboard system with persistent storage
- December 4, 2025: Added Lagos atmosphere elements - palm trees, sun, clouds, skyline, billboards
- December 4, 2025: Optimized skyline building window rendering for mobile performance
- December 4, 2025: Initial complete implementation of the Lagos-themed endless runner
