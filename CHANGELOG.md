# Changelog

All notable changes to the Olè - The Lagos Hustle game will be documented in this file.

## [2.0.0] - December 2024

### Sprint 2: Gameplay Improvements & Mobile Optimization

#### Wire Obstacle Overhaul
- **Added barbed wire on top**: Bright red spikes with twisted coil rings and a yellow/red caution bar to clearly indicate the obstacle cannot be jumped over
- **Added wire mesh in middle section**: Dense grid of horizontal, vertical, and diagonal wires filling the entire middle compartment, making it visually clear that sliding is the only option

#### Traffic Spike (formerly Thorns) Update
- **Changed color to bright yellow**: Spikes are now highly visible and don't blend in with the road
- **Added dark tips**: Spikes have contrasting dark tips for better visibility
- **Renamed in instruction manual**: "Thorns" renamed to "Traffic Spike" for clarity
- **Updated instruction manual icon**: The tutorial image now reflects the new yellow color scheme

#### Game Speed Fix
- **Fixed speed progression slowdown**: Changed from ease-out curve to linear progression
- **Extended ramp distance**: Speed now consistently increases from start (0.2) to max (1.0) over distance 3200, eliminating the mid-game slowdown around score 1100

#### Mobile Controls Optimization
- **Lowered position**: Controls moved from 100px to 30px from bottom, appearing behind the player character
- **Reduced button size**: Buttons shrunk from 70px to 52px diameter for less screen obstruction
- **Tightened spacing**: Gaps between buttons reduced for a more compact layout
- **Increased transparency**: Controls are slightly more transparent to reduce visual distraction

#### HUD Improvements
- **Smaller score boxes**: Reduced padding, font sizes, and border radius on score/best score displays for a cleaner mobile experience

#### Backend Updates
- **Leaderboard archive system**: Created `leaderboard_archive` table to preserve historical weekly challenge data
- **Weekly challenge reset**: Leaderboard cleared for new weekly challenge (Week 2 - December 2024)
- **56 player scores archived**: Previous week's scores safely stored with "Week 1 - December 2024" label

---

## [1.0.0] - December 2024

### Initial Release
- 3D endless runner game with Lagos, Nigeria theme
- Three.js-based 3D graphics
- Three-lane movement system with jump and slide mechanics
- Collectibles: Money, phones, and food items
- Obstacles: Tires, thorns, and electric wires
- PostgreSQL-backed leaderboard system
- Mobile touch controls
- Audio system with background music and sound effects
- Instruction manual with visual guides
