# Product Decisions Log

This document captures the key product decisions made during the development of Olè, including the rationale, alternatives considered, and outcomes.

---

## Decision Framework

For each major decision, we consider:
1. **User Impact**: How does this affect the player experience?
2. **Technical Feasibility**: Can we build this reliably?
3. **Cultural Authenticity**: Does this respect and represent Lagos accurately?
4. **Business Viability**: Does this support long-term success?

---

## Decision 1: Game Genre Selection

### Context
Needed to choose a game format that would be accessible, culturally relevant, and technically feasible for web deployment.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| Endless Runner | Simple mechanics, proven engagement, mobile-friendly | Crowded genre |
| Puzzle Game | Deep engagement, accessibility | Less action, harder to theme |
| Racing Game | Exciting, multiplayer potential | Complex controls, heavy assets |
| **Endless Runner (Chosen)** | Best balance of accessibility and thematic opportunity | Must differentiate strongly |

### Decision
**Endless Runner** - The genre's simplicity allows cultural elements to shine without gameplay complexity barriers. Lagos' bustling streets naturally fit the "running through obstacles" metaphor.

### Outcome
The endless runner format successfully frames Lagos street life in an intuitive gameplay context. Players immediately understand the premise.

---

## Decision 2: Cultural Theme Depth

### Context
Determining how deeply to integrate Nigerian/Lagos culture - surface-level aesthetics vs. deep integration.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| Light Theming | Faster development, broader appeal | Forgettable, lacks authenticity |
| **Deep Integration** | Unique identity, cultural value, shareability | Requires research, some references may be missed by global audiences |
| Stereotypical | Easy recognition | Potentially offensive, lazy |

### Decision
**Deep Cultural Integration** - Every visual element references real Lagos:
- Danfo buses (iconic yellow minibuses)
- Market stalls with specific goods
- Naira currency as collectibles
- Food items (jollof rice, plantains)
- Golden "magic hour" lighting of Lagos evenings
- Palm trees and tropical vegetation

### Outcome
Players from Lagos/Nigeria express recognition and delight. Global players report the setting feels "fresh" and "distinctive" compared to typical game environments.

---

## Decision 3: Character Design Philosophy

### Context
How to design a player character that represents "running in Lagos" without making problematic assumptions about identity.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| Realistic Human | Relatable | Animation complexity, identity assumptions |
| Cartoon Human | Friendly, simpler | Still carries identity implications |
| **Abstract/Masked** | Universal, culturally rich, simple | Less immediately relatable |
| Animal Character | Avoids human issues | Doesn't fit "hustle" theme |

### Decision
**African Mask Design** - Character wears a traditional African mask, creating:
- Cultural reference to African art traditions
- Universal appeal (anyone can project onto the character)
- Distinctive silhouette for gameplay clarity
- Simpler animation requirements

The mask features feathers and a flowing cloak, suggesting movement and energy without requiring realistic human rendering.

### Outcome
Character reads as "African" without assuming specific identity. The masked figure becomes a recognizable "brand" element.

---

## Decision 4: Difficulty Curve Design

### Context
Balancing challenge to maintain engagement without frustrating new players.

### Problem Statement
Early playtesting revealed:
- New players dying too quickly felt discouraged
- Experienced players found early game boring
- Score distribution was bimodal (low scores + very high scores)

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| Static Difficulty | Consistent, fair | Boring for skilled players |
| Continuous Scaling | Always challenging | Can feel punishing |
| **Tiered Progression** | Predictable milestones, tunable | Requires more balancing |

### Decision
**9-Tier Progressive Difficulty System**

```
Tiers 1-4: Learning (Distance 0-600)
- Single obstacles only
- High collectible rates (85% → 70%)
- Slow speed increases (0.20 → 0.40)
- Goal: Build confidence and teach mechanics

Tiers 5-7: Challenge (Distance 600-1800)
- Dual obstacles introduced
- Moderate speed (0.50 → 0.72)
- Goal: Test skills, create "flow state"

Tiers 8-9: Mastery (Distance 1800+)
- Up to 3 simultaneous obstacles
- High speed (0.85 → 1.00)
- Goal: Aspirational challenge, bragging rights
```

### Key Insights
1. **Front-load the fun zone**: Most players spend 70% of playtime in tiers 3-6
2. **Late game is aspirational**: Reaching tier 8+ is an achievement to share
3. **Obstacle spacing matters**: 15-unit gaps between obstacles in a wave ensure fair reactions

### Outcome
Score distribution became more normal. Player feedback: "challenging but fair." Retry rates increased as players felt close to achieving next tier.

---

## Decision 5: Lane System vs. Free Movement

### Context
Choosing how players move horizontally to avoid obstacles.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| Free Movement | More control | Collision detection ambiguity, harder on mobile |
| 5 Lanes | More strategic options | Too many choices, slower decisions |
| **3 Lanes** | Clear decisions, mobile-optimized | Less freedom |
| 2 Lanes | Very simple | Too limited, boring |

### Decision
**3-Lane System** - Creates a perfect decision space:
- Left, Center, Right are immediately understood
- Every position has exactly 2 escape routes
- Mobile players can tap clearly distinct zones
- Collision detection is unambiguous

### Supporting Design
- Lanes are visually delineated on the road
- Lane width accommodates both player and obstacles clearly
- Transition animation (smooth glide) gives visual feedback

### Outcome
Zero player confusion about "which lane am I in?" Obstacle avoidance feels deterministic rather than luck-based.

---

## Decision 6: Collectible Economy

### Context
Designing what players collect and how it feeds into scoring.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| Single Collectible Type | Simple | Monotonous |
| **Multiple Types with Varying Values** | Visual variety, strategic choices | Balancing complexity |
| Combo System | Deep mechanics | Too complex for casual play |

### Decision
**Three Collectible Types with Cultural Relevance**

| Type | Points | Spawn Rate | Cultural Connection |
|------|--------|------------|---------------------|
| Naira (Money) | 10 | 40% | Universal Lagos aspiration |
| Phone | 20 | 20% | Tech culture, "runs" |
| Food | 5 | 40% | Street food culture |

### Rationale
- **Money as primary**: Everyone understands "get money" - it's the Lagos hustle
- **Phones as premium**: Higher risk/reward, references tech-savvy Lagos youth
- **Food as ambient**: Easy wins, celebrates Lagos street food culture
- **Point values create strategy**: Is the phone worth moving across two lanes?

### Outcome
Players develop preferences ("I'm a phone hunter") while money remains the reliable baseline.

---

## Decision 7: Obstacle Design Philosophy

### Context
Creating obstacles that are challenging but fair, with clear visual language.

### Core Principles Established
1. **Every obstacle must have a counter-action** (jump or slide)
2. **Obstacles must be visually distinct** even at speed
3. **Height indicates counter**: Low = jump, high = slide
4. **No instant deaths**: Forgiving hit detection

### Obstacle Set

| Obstacle | Counter | Visual Design | Rationale |
|----------|---------|---------------|-----------|
| Tires | Jump | Stacked black cylinders | Common Lagos road sight |
| Thorns | Jump | Spike strips (red tint) | Police chase reference |
| Electric Wires | Slide | Horizontal lines, high position | Lagos infrastructure reality |

### Decision Against
- **Moving obstacles**: Too unpredictable, feels unfair
- **Multiple-action obstacles**: Too complex (e.g., "jump then immediately slide")
- **Invisible hazards**: Always unfair

### Outcome
Players report dying feels "their fault" not the game's. Quick learning curve for obstacle recognition.

---

## Decision 8: Mobile Control Scheme

### Context
Many players access on mobile devices. Touch controls must be intuitive and responsive.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| Swipe Gestures | Natural, minimal UI | Gesture recognition errors, accidental inputs |
| Screen Regions | Clear zones | Fingers cover important visuals |
| **D-Pad UI** | Familiar, precise, unambiguous | Takes screen space |
| Tilt Controls | Novel | Accessibility issues, inconsistent |

### Decision
**Centered D-Pad with Color Coding**
- Positioned at bottom center (accessible by both thumbs)
- Color-coded buttons:
  - Left/Right: Directional arrows
  - Up: Jump indicator
  - Down: Slide indicator
- Semi-transparent to minimize visual interference
- Large touch targets (44px+ for accessibility)

### Technical Implementation
- `passive: false` on touch events to ensure immediate response
- Prevent default to avoid scroll/zoom interference
- Visual feedback on press

### Outcome
Mobile players report controls feel "console-like" in precision. No reported issues with accidental inputs.

---

## Decision 9: Leaderboard Scope

### Context
How to implement social competition in a way that motivates without discouraging.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| Global Top 100 | Shows best players | Intimidating for new players |
| **Top 5 Only** | Achievable goal, clean UI | Less recognition for #6-100 |
| Friends Only | Personal competition | Requires social graph |
| Personal Best Only | No discouragement | No social motivation |

### Decision
**Top 5 Global Leaderboard**
- Displayed on start screen (motivation before playing)
- Displayed on game over (motivation to retry)
- Only stores highest score per username
- Visible goal: "I can make top 5"

### Psychological Design
- 5 is small enough to feel achievable
- Seeing scores just above yours creates "almost there" motivation
- Using usernames creates "I want MY name up there"

### Outcome
Players report trying "just one more run" to reach or maintain leaderboard position.

---

## Decision 10: Session Architecture

### Context
Designing the game flow from load to replay to retain players.

### Session Flow Design

```
LOAD → MENU → PLAYING → GAME OVER → MENU or RETRY
         ↑                              ↓
         └──────────────────────────────┘
```

### Key Decisions

1. **Username Required Before Play**
   - Creates investment before first run
   - Enables leaderboard participation
   - Persists in localStorage for returning players

2. **Leaderboard Visible on Menu**
   - Motivation before playing
   - Social proof of active players

3. **One-Tap Restart**
   - Minimize friction to retry
   - Keep players in flow state

4. **Menu Option on Game Over**
   - Allow comparison with leaderboard
   - Natural exit point
   - Username change opportunity

### Anti-Patterns Avoided
- ❌ Forced interstitials between games
- ❌ Long loading between attempts
- ❌ Mandatory tutorials on every run
- ❌ Punishing score displays ("You only got 50!")

### Outcome
High retry rates, with most sessions including 3+ runs.

---

## Lessons Learned

### What Worked
1. **Cultural depth over breadth**: Deep Lagos integration resonated more than trying to represent "all of Africa"
2. **Forgiveness over punishment**: Health system (3 hearts) keeps players engaged longer
3. **Clear visual language**: Distinct obstacle/collectible designs reduced confusion
4. **Tiered difficulty**: Predictable progression milestones

### What We'd Do Differently
1. **Sound earlier**: Audio adds significant atmosphere, should be MVP
2. **More playtesting mid-development**: Some balance issues found late
3. **Analytics from start**: Would help quantify design decisions

### Future Experiments
1. **Daily challenges**: Curated runs for shared experience
2. **Seasonal themes**: Events like "Detty December" with special content
3. **Character customization**: Expression without gameplay impact

---

## Appendix: Metrics Framework

### Core Loop Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Session Length | 3+ min | Client timing |
| Runs per Session | 3+ | Count restarts |
| Retry Rate | 60%+ | Game overs → immediate replay |

### Engagement Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| D1 Retention | 30% | Return within 24h |
| Weekly Active | 50% of total | Unique sessions per week |
| Average Score | Tier 4-5 (300-600) | Score distribution |

### Social Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Leaderboard Submissions | 90%+ of games | API calls |
| Username Persistence | 80%+ | Returning with same name |

---

*Last Updated: December 2024*
