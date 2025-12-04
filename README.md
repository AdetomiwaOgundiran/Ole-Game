# Olè - The Lagos Hustle 🏃‍♂️🇳🇬

**A culturally-authentic 3D endless runner game celebrating Lagos street life**

[Play Now](https://ole-game.com) | [Product Decisions](./PRODUCT_DECISIONS.md)

![Game Preview](https://img.shields.io/badge/Platform-Web-blue) ![Tech](https://img.shields.io/badge/Built%20with-Three.js-green) ![Status](https://img.shields.io/badge/Status-Live-success)

---

## TL;DR

> **What**: 3D endless runner set in Lagos, Nigeria - dodge tires, collect naira, compete on leaderboards
> 
> **Who**: Nigerian youth, African diaspora, and global casual gamers seeking fresh cultural experiences
> 
> **Why**: African gamers deserve representation; global audiences want unique settings
> 
> **Tech**: Three.js, vanilla JavaScript, Node.js backend
> 
> **Try it**: [Play the live game](https://ole-game.com)

---

## Product Vision

**Olè** reimagines the endless runner genre through the lens of Lagos, Nigeria - one of Africa's most vibrant and dynamic cities. The game captures the energy, chaos, and charm of Lagos street life while delivering an engaging, replayable gaming experience.

### The Problem We're Solving

The mobile/casual gaming market is saturated with culturally homogeneous experiences. African gamers rarely see their environments, sounds, and daily experiences represented in games. Meanwhile, global audiences miss out on the rich visual and cultural tapestry that African cities offer.

**Olè** bridges this gap by:
- Creating representation for Nigerian/African players who want to see their world in games
- Introducing global players to Lagos culture in an accessible, fun format
- Proving that culturally-specific content can have universal gaming appeal

---

## Target Audience

### Primary: Nigerian Youth (16-30)
- **Insight**: Young Nigerians are highly engaged with mobile gaming but underserved with local content
- **Behavior**: Active on social media, competitive with friends, value cultural pride
- **Need**: Games that reflect their identity and can be shared as cultural artifacts

### Secondary: African Diaspora
- **Insight**: Nostalgic for home environments, active in sharing cultural content
- **Behavior**: Use games as conversation starters about heritage
- **Need**: Authentic representation that doesn't rely on stereotypes

### Tertiary: Global Casual Gamers
- **Insight**: Seeking fresh, unique gaming experiences beyond typical settings
- **Behavior**: Drawn to visually distinctive games, share discoveries on social platforms
- **Need**: Easy-to-learn games with cultural depth

---

## Core Game Loop

```
START → RUN → AVOID/COLLECT → SCORE → DIE → COMPETE → RETRY
```

### Player Journey

1. **Onboarding** (0-30 seconds)
   - Enter username (creates investment)
   - See top 5 leaderboard (creates aspiration)
   - Simple controls tutorial implicit in first run

2. **Early Game** (0-300 points)
   - Gentle difficulty curve builds confidence
   - Frequent collectibles create positive reinforcement
   - Lagos environment establishes theme

3. **Mid Game** (300-1000 points)
   - Speed increases create tension
   - Obstacle variety requires strategy
   - Players develop personal techniques

4. **Late Game** (1000+ points)
   - High speed tests mastery
   - Multiple simultaneous obstacles
   - Achievement of reaching this stage creates shareable moments

5. **Game Over → Retention**
   - Score comparison (beat your best?)
   - Leaderboard position (beat others?)
   - One-tap restart (minimize friction to retry)

---

## Key Features & Design Rationale

### 1. Lagos-Themed Environment
| Element | Cultural Reference | Game Purpose |
|---------|-------------------|--------------|
| Yellow Danfo Buses | Iconic Lagos public transport | Roadside scenery, authenticity |
| Market Stalls | Ubiquitous street commerce | Visual variety, obstacle framing |
| Palm Trees | Tropical Nigeria landscape | Depth cues, atmosphere |
| Warm Golden Lighting | Lagos evening aesthetic | Emotional warmth, nostalgia |

**Why it matters**: Environment isn't just decoration—it's the core differentiator. Every visual element was chosen for cultural authenticity AND gameplay clarity.

### 2. Masked Character Design
The player character wears a traditional African mask, intentionally abstracted to:
- Allow players of any identity to project onto the character
- Reference African artistic traditions
- Create a distinctive, recognizable silhouette
- Avoid the complexity of realistic human animation

### 3. Three-Lane Movement System
**Decision**: Use discrete lanes vs. free horizontal movement

| Option | Pros | Cons |
|--------|------|------|
| Free movement | More control | Harder on mobile, collision ambiguity |
| **3 Lanes (Chosen)** | Clear decisions, mobile-friendly | Less freedom |

**Rationale**: Endless runners succeed when decisions are clear and fast. Three lanes create a perfect decision space—meaningful choices without overwhelming options.

### 4. Collectible System
| Item | Points | Spawn Rate | Design Intent |
|------|--------|------------|---------------|
| Money (Naira) | 10 | High | Base reward, keeps players engaged |
| Phone | 20 | Medium | Higher risk/reward, requires positioning |
| Food | 5 | High | Thematic, easy wins, cultural touchpoint |

**Insight**: Point values were balanced through playtesting to ensure money remains the primary target while phones create "reach" moments worth the risk.

### 5. Obstacle Variety & Counterplay
| Obstacle | Counter | Skill Tested |
|----------|---------|--------------|
| Tires | Jump | Timing, anticipation |
| Thorns | Jump | Pattern recognition |
| Electric Wires | Slide | Vertical awareness |

**Design Principle**: Every obstacle must have a learnable counter. No "unfair" deaths. Players should always feel they could have survived with better play.

### 6. Progressive Difficulty System
Nine difficulty tiers based on distance traveled:

```
Tier 1-4 (0-600):   Learning phase, single obstacles, forgiving
Tier 5-7 (600-1800): Challenge phase, speed increases, dual obstacles
Tier 8-9 (1800+):   Mastery phase, high speed, complex patterns
```

**Key Insight**: Difficulty scaling isn't linear. We front-load the "fun zone" where players feel skilled but challenged. The extreme late-game exists to create aspirational goals, not as the expected experience.

### 7. Leaderboard & Social Competition
- **Top 5 Display**: Creates achievable goals (not showing top 100)
- **Username System**: Investment through identity
- **Persistent Scores**: Players return to defend rankings
- **Visible on Menu**: Motivation before every run

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                     │
├─────────────────────────────────────────────────────────┤
│  index.html    │  style.css    │  game.js (Three.js)   │
│  Entry point   │  UI styling   │  Game logic & render  │
└────────────────┴───────────────┴───────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                   SERVER (Node.js)                       │
├─────────────────────────────────────────────────────────┤
│  server.js                                               │
│  ├── Static file serving                                │
│  ├── GET /api/leaderboard                               │
│  └── POST /api/score                                    │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│              DATA (PostgreSQL Database)                  │
├─────────────────────────────────────────────────────────┤
│  leaderboard table                                       │
│  └── { id, username, score, created_at, updated_at }   │
└─────────────────────────────────────────────────────────┘
```

**Why This Stack?**
- **Three.js**: Enables 3D graphics in browser without plugins
- **Vanilla JS**: No framework overhead, fast load times
- **PostgreSQL**: Persistent database storage, survives deployments
- **Node.js Server**: Lightweight, handles API + static serving

---

## Performance Considerations

| Challenge | Solution |
|-----------|----------|
| Mobile GPU limitations | Simplified geometry, limited draw calls |
| Touch input latency | Passive event listeners, immediate feedback |
| Network reliability | Leaderboard caches locally, retries on failure |
| Browser caching | Cache-busting on API calls, proper headers |

---

## Metrics & Success Criteria

### Engagement Metrics
- **Session Length**: Target 3+ minutes average
- **Sessions per User**: Target 3+ daily for retained users
- **Retry Rate**: % of game overs leading to immediate replay

### Retention Metrics
- **D1 Retention**: Return within 24 hours
- **D7 Retention**: Weekly active users

### Viral Metrics
- **Social Shares**: Screenshot/score shares
- **Referral Rate**: New users from existing user shares

---

## Future Roadmap

### Phase 1: Core Polish (Current)
- [x] Progressive difficulty system
- [x] Leaderboard system
- [x] Mobile-optimized controls
- [x] Lagos environment theming

### Phase 2: Engagement Features
- [ ] Daily challenges with unique modifiers
- [ ] Achievement system (milestones, challenges)
- [ ] Character customization (masks, cloaks)
- [ ] Sound design (Lagos street sounds, music)

### Phase 3: Social & Monetization
- [ ] Social sharing integration
- [ ] Friend leaderboards
- [ ] Cosmetic shop
- [ ] Seasonal events (Detty December, etc.)

### Phase 4: Expansion
- [ ] Additional Nigerian city themes (Abuja, Port Harcourt)
- [ ] Power-ups and special abilities
- [ ] Multiplayer racing mode

---

## Controls

| Input | Desktop | Mobile |
|-------|---------|--------|
| Move Left | ← or A | D-pad Left |
| Move Right | → or D | D-pad Right |
| Jump | ↑ or W | D-pad Up |
| Slide | ↓ or S | D-pad Down |

---

## Local Development

```bash
# Clone the repository
git clone https://github.com/AdetomiwaOgundiran/Ole-Game.git

# Navigate to project
cd Ole-Game

# Install dependencies
npm install

# Start the server
node server.js

# Open in browser
# http://localhost:5000
```

---

## Project Structure

```
ole-lagos-hustle/
├── index.html          # Game HTML structure
├── style.css           # UI and game styling
├── game.js             # Three.js game logic (~1400 lines)
├── server.js           # Node.js server with PostgreSQL API
├── README.md           # This file
├── PRODUCT_DECISIONS.md    # Detailed product rationale
└── replit.md           # Development notes
```

---

## Acknowledgments

- Built with [Three.js](https://threejs.org/)
- Inspired by the energy and spirit of Lagos, Nigeria
- Cultural consultation from Lagos residents and diaspora

---

## License

MIT License - Feel free to fork and create your own culturally-themed runners!

---

**Made with ❤️ for Lagos**
