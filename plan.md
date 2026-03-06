# Reenlistment Game — Work Plan

> **Last updated:** Session 8 (Mar 2026)
> **File:** `plan.md` — update this at the end of every session.

---

## A. General Work Plan

**Goal:** A browser-based Marine Corps enlisted career simulation playable on desktop and mobile — no build step, no frameworks, open `index.html` directly.

**Player experience:** Manage a Marine's career from boot camp through 4-20+ years of service. Make quarterly decisions about focus, respond to random life events, navigate reenlistment windows, and reach one of seven distinct end states.

**Tech stack:** Vanilla HTML/CSS/JS | localStorage saves | No dependencies

**Design pillars:**
1. Realism — correct terminology, ranks, timelines, pay, duty stations
2. Replayability — 50+ events, branching outcomes, 5 MOS fields, 5 backgrounds
3. Consequence — every choice affects stats that feed into end states
4. Accessibility — works on any device without installation

---

## B. Implementation by Stages

### Stage 1 — Foundation ✅ COMPLETE
Core engine, screens, stat model, finance, career logic, events, save/load.

| File | Purpose |
|------|---------|
| `index.html` | All screen shells, stat panels, event cards, modal |
| `css/style.css` | Mobile-first responsive layout, dark military theme |
| `js/state.js` | Single game state object, localStorage save/load |
| `js/character.js` | Marine model, stat helpers, track progress, BACKGROUNDS |
| `js/finance.js` | Pay tables (E1-E9), BAH/BAS, monthly budget |
| `js/career.js` | Promotions, reenlistment windows (FY-based), EAS, SRB |
| `js/events.js` | Event roller, choice resolver, deployment countdown |
| `js/engine.js` | Quarterly turn pipeline (3-month advances) |
| `js/ui.js` | All DOM rendering, modals, end states |
| `js/main.js` | Screen routing, advance-quarter flow |
| `js/data/mos.js` | 15 MOS options across 9 fields |
| `js/data/assignments.js` | 10 duty stations with optempo/lifestyle scores |
| `js/data/promotions.js` | E1-E9 rank data, PME requirements, contract lengths |
| `js/data/schools.js` | PME, specialty schools, college programs |
| `js/data/events_data.js` | 50+ random events (career, personal, leadership, finance) |

### Stage 2 — Content Depth 🔄 IN PROGRESS (~95%)
Filling out gameplay: PCS moves, PME tracking, assignment screen, awards visibility.

**Completed in Stage 2 (Sessions 1–6):**
- [x] 30+ additional events (leadership, family, conflicts, young Marine life)
- [x] Quarterly (3-month) turn system instead of monthly
- [x] Reenlistment bug fixed (once per contract, FY-based timing)
- [x] Debt payoff focus choice
- [x] Promotion path past E-4 fixed — PME pathway via `focus_pme` choice
- [x] Natural stat decay added (fitness, MOS prof, profConduct under stress, family stability)
- [x] Dynamic context-based focus choices (rank-gated, deployment-gated, injury-gated, PME-gated)
- [x] Button text corrected: "ADVANCE QUARTER"
- [x] PCS system (`js/pcs.js`) — duty station selection with 4 options, moving costs, IPCOT protection, OCONUS eligibility, optempo + QOL effects
- [x] End-state outcome system — `Career.civilianOutlook()`, `retirementProjection()`, `reserveRetirementPath()`, `UI.renderEndOutlook()` with CSS; three detailed panels per end state
- [x] SMCR/IRR reserve pathway — `Main.showReserveDecision()` intercepts all EAS paths; drill pay, AT pay, and pension formulas displayed
- [x] Career log removed — stripped from index.html, ui.js, and style.css
- [x] End screen scroll fix — `#screen-end` changed from `justify-content: center` to `flex-start` with `overflow-y: auto`
- [x] Name auto-capitalize — `character.js` normalizes name at creation via regex; rank abbreviation prepended to name in all end-state narratives and subtitle
- [x] Retirement pay fix — `Finance.RETIREMENT_BASE_PAY` table added using 2024 DFAS 20-year rates
- [x] Play Again stale-events bug fixed — `showGameScreen()` clears prior event state
- [x] Monthly debt interest — 12% APR (1%/month) accrues in `Finance.runMonthly()`
- [x] Debt escalation events — 3 threshold events ($2k/$5k/$10k) with command visibility consequences

**Completed in Stage 2 (Session 7):**
- [x] Multi-select focus choices with Bandwidth budget — `Engine.focusBudget(marine)` (base 5, rank bonus, stress penalty, min 2); `cost` on every MONTHLY_CHOICES entry; `UI._selectedFocuses` (Set) replaces single `_selectedFocus`; pip display; `.unaffordable` dimming
- [x] Static panel divider on desktop — 6px `#resize-handle` between stats and events panels
- [x] Game start date corrected to Jan 2026
- [x] Title screen centering fixed — `margin: auto` on `.title-content`
- [x] Male/Female gender selection at character creation — gender buttons, `Character.create()` stores `gender`, `pronoun`, `pronounObj`, `pronounPos`, `pronounRefl` on marine; `_checkCreateReady()` requires gender
- [x] Event cards visually prominent — category-colored 4px left border (`cat-border-*`); header text white; body font bumped to 0.88rem; choice hover shows green left-border accent
- [x] Promotion alerts styled distinctly — `type: 'promo'` in engine.js; `.alert-promo` CSS: gold, bold, glow
- [x] Decision modal improved — top tan accent bar, icon 2rem, title white, choice hover with green left border
- [x] Deployment destinations — `deployLocations` arrays on both deployment events (4 options each); `rollEvent()` picks a random one and attaches `chosenLocation`; location banner rendered in event card body
- [x] Deployment tax-free pay display — `Finance.deploymentBreakdown(marine, months, isCombat)`; event cards show full pay table with TAX-FREE badges, monthly total, tax savings, and total deployment earnings
- [x] First-turn orientation panel — `#orientation-panel` in events panel; explains left/stats panel sections, bandwidth system, advance flow, and key career warnings; dismiss button sets `State.game.orientationDismissed`; mobile version shows STATS/EVENTS tab tip and responsive section labels

**Completed in Stage 2 (Session 8):**
- [x] End-state name format — changed from "Rank Last, First" to "Rank Last" in all END_STATES narratives and subtitle (ui.js: `m.name.split(',')[0].trim()`)
- [x] EAS wind-down system — when player chooses EAS at reenlistment window, game continues for remaining contract months instead of ending immediately; `State.game.easDecided` flag; `EVENTS_EAS` pool (6 sequential out-processing events: TAP/TRS class, final physical, gear turn-in, clearing barracks, coordinating the move, DD-214 review); `Events.rollEASPrepEvent()` cycles pool in order; engine.js injects one EAS prep event per quarter when `easDecided`; PCS suppressed when `easDecided`; when TIS >= contractEnd with `easDecided`, goes straight to `triggerEAS()` without modal
- [x] EAS events styled — `isChance: true`, `chanceType: 'neutral'`, single ACKNOWLEDGED button; `.cat-eas` chip (gold/khaki `#c8b870`) and `.cat-border-eas` added to `game-events.css`
- [x] Rifle range practice mode — `RifleQual.startPractice()` skips quiz, sets `_practiceMode = true`, no stat effects, no save; results show "RIFLE RANGE — PRACTICE" label and "Practice score — no career effects applied."; done button says "BACK TO MAIN MENU" and routes to `screen-title`; RIFLE RANGE button (`btn-tertiary`) on title screen; `.btn-tertiary` CSS added
- [x] Rifle range practice bug fix — `rq-prerange` overlay explicitly hidden in `startPractice()` before `_showPositionIntro(0)` to prevent pre-range brief appearing over position intro
- [x] Character creation back button — "← BACK TO MAIN MENU" button added to create footer; "SHIP OUT TO MCRD →" arrows added; footer changed to `flex-direction: row` with gap
- [x] Distance chip on rifle range header — static "500 · 300 · 100 M" replaced with dynamic `#rq-dist-chip` that updates per position in `_updateTopbar()`; `.rq-dist-chip` CSS (rounded pill, tan, `border-hi`); all distances corrected from meters to yards ("M" → "YD") in descriptions, instruction bar text, chip, and HTML default
- [x] Rifle qual badge distance — `rq-pos-num` previously showed "POSITION X OF 3 · 500 M"; now just shows position; distance shown in chip only

**Remaining in Stage 2:**
- [ ] PME tracker — visible progress toward each school requirement in UI
- [ ] Awards display — list earned awards in the stats panel
- [ ] Lateral move decision — MOS change event/screen
- [ ] MOS-specific events — events that only fire for specific MOS fields

### Stage 3 — Polish & Balance ⏳ NOT STARTED
Gameplay feel, UI improvements, difficulty tuning.

- [ ] Balance pass — review stat progression rates, event outcome magnitudes
- [ ] Tooltips — hover/tap any stat bar to get a description
- [ ] Promotion alert detail — show what's blocking a promotion (missing PME, TIS, score)
- [ ] Finance detail screen — monthly breakdown modal (pay + BAH + BAS - expenses)
- [ ] Smoother mobile UX — swipe gestures between panels
- [ ] End state scoring — show a detailed career summary with "letter grade" per track
- [ ] Animated stat bar changes — visual feedback when stats increase/decrease

### Stage 4 — Advanced Features ⏳ NOT STARTED
Deep content for replayability and long-term interest.

- [ ] Enlisted-to-Officer pathway — MECEP/OCS commissioning event chain
- [ ] Post-EAS civilian career module — job search, college completion, VA benefits usage
- [ ] Family depth — named spouse, children milestone events (first steps, school, etc.)
- [ ] Full PME school assignment screen — select school timing, track progress
- [ ] Unit OPTEMPO variation — duty station changes affect monthly event weights
- [ ] Multiple save slots — up to 3 concurrent careers
- [ ] Career comparison at end state — see alternate career paths not taken
- [ ] Sound design — optional ambient background, event audio cues

---

## C. Checklist

### Stage 1 — Foundation
- [x] Project directory structure
- [x] index.html (all screen containers)
- [x] css/style.css (mobile-first, dark military theme)
- [x] js/data/mos.js (15 MOS, 9 fields)
- [x] js/data/assignments.js (10 duty stations)
- [x] js/data/promotions.js (E1-E9, PME gates, contract lengths)
- [x] js/data/schools.js (PME, specialty, education)
- [x] js/data/events_data.js (original 20 events)
- [x] js/state.js (save/load/init)
- [x] js/character.js (marine model, backgrounds, clamp)
- [x] js/finance.js (pay tables, BAH, BAS, monthly budget)
- [x] js/career.js (promotions, reenlistment, EAS, SRB)
- [x] js/events.js (roller, resolver, deployment)
- [x] js/engine.js (monthly turn pipeline)
- [x] js/ui.js (all rendering, modals, end states)
- [x] js/main.js (routing, advance flow)
- [x] CSS specificity bug fixed (game screen always showing)
- [x] Title screen working
- [x] Character creation working
- [x] Boot camp narrative working
- [x] Main game loop working
- [x] Stat bars rendering
- [x] Event cards with choices
- [x] Reenlistment modal working
- [x] End state screens working
- [x] localStorage save/load working

### Stage 2 — Content Depth
- [x] 30+ new events added (leadership, family, conflicts, young Marine life, mental health)
- [x] Quarterly turn system (3-month advances)
- [x] Reenlistment fixed (once per contract, FY-based, `reenlistWindowOffered` flag)
- [x] SRB calculation updated (paygrade + MOS field + years + ProCon)
- [x] Debt payoff quarterly focus option
- [x] Promotion path past E-4 — `Career._nextRequiredPME()`, `focus_pme` choice grants distance PME, school event grants resident PME
- [x] Natural stat decay — physFitness -0.5/mo, mosProficiency -0.3/mo, profConduct -0.5/mo under stress, familyStability -0.3/mo if married
- [x] Dynamic context-based choices — rank gates (E-5+), deployment gates, injury gate (major), PME availability gate
- [x] Button text corrected to "ADVANCE QUARTER"
- [x] PCS system (`js/pcs.js`) — 4-option duty station pick, costs, IPCOT guard, OCONUS eligibility, stat effects applied on arrival
- [x] End-state outcome system — civilian salary projection, SMCR/IRR reserve breakdown, retirement pension display
- [x] SMCR/IRR reserve pathway — intercepts all EAS paths; points formula, drill pay, AT pay displayed
- [x] Retirement pay fix — `Finance.RETIREMENT_BASE_PAY` using 2024 DFAS values
- [x] Monthly debt interest — 12% APR accrues before expense calc
- [x] Debt escalation events — 3 threshold events ($2k/$5k/$10k) with command visibility consequences
- [x] Career log removed (no player value)
- [x] End screen scroll fixed (`flex-start` + `overflow-y: auto`)
- [x] Name capitalization + rank prefix in all end-state narratives and subtitle
- [x] Play Again stale-events bug fixed — `showGameScreen()` clears prior event state
- [x] Multi-select Bandwidth focus system — `Engine.focusBudget()`, costs on all choices, pip display, `.unaffordable` state
- [x] Gender selection at character creation — M/F buttons, pronoun helpers stored on marine
- [x] Event cards visually prominent — `cat-border-*` left borders, white header text, choice hover accent
- [x] Promotion alerts gold/distinct — `alert-promo` CSS class with glow
- [x] Modal improvements — top accent bar, larger icon, white title, choice hover border
- [x] Deployment destinations — `deployLocations` arrays, random selection in `rollEvent()`, location banner in card
- [x] Deployment tax-free pay table — `Finance.deploymentBreakdown()`, TAX-FREE badges, totals in event card
- [x] First-turn orientation panel — explains all mechanics, bandwidth, tabs; dismissable; mobile-responsive labels
- [x] End-state name format — "Rank Last" only (no first name)
- [x] EAS wind-down system — `easDecided` flag, `EVENTS_EAS` pool, `rollEASPrepEvent()`, engine injection, PCS suppression
- [x] EAS events styled — `isChance: true`, `.cat-eas` chip, ACKNOWLEDGED button
- [x] Rifle range practice mode — `startPractice()`, `_practiceMode` flag, title screen RIFLE RANGE button, `.btn-tertiary`
- [x] Character creation back button — inline with SHIP OUT, arrows on both buttons
- [x] Distance chip on rifle range — dynamic `#rq-dist-chip`, yards throughout
- [ ] PME progress visible in UI
- [ ] Awards list in stats panel
- [ ] Lateral move event chain
- [ ] MOS-specific events

### Stage 3 — Polish
- [ ] Balance pass
- [ ] Stat tooltips
- [ ] Promotion blocker details
- [ ] Finance detail modal
- [ ] End state scoring detail
- [ ] Animated stat changes

### Stage 4 — Advanced
- [ ] Officer commissioning path
- [ ] Post-EAS civilian module
- [ ] Family depth
- [ ] Multiple save slots
- [ ] Career comparison

---

## D. Progress

| Stage | Items Complete | Items Total | % |
|-------|---------------|-------------|---|
| Stage 1 — Foundation | 30 | 30 | **100%** |
| Stage 2 — Content Depth | 31 | 35 | **~89%** |
| Stage 3 — Polish | 0 | 6 | **0%** |
| Stage 4 — Advanced | 0 | 8 | **0%** |
| **OVERALL** | **61** | **79** | **~77%** |

---

## E. Next Actions (Priority Order)

### Immediate (next session)
1. **Awards Display in Stats Panel**
   - Show earned awards list below career tracks in the stats sidebar
   - Small chips: "Combat Action Ribbon", "NAM", etc.
   - Files: `js/ui.js` (update `renderGameState()`)

2. **PME Progress in UI**
   - Below the career tracks, show a "PME" section listing completed schools
   - Show what's next required for the next promotion
   - Files: `js/ui.js` (new section in stats panel)

3. **Balance Pass** — review stat delta magnitudes, event trigger weights, promotion frequency; ensure debt interest doesn't spiral too fast for new players

### Soon (following sessions)
4. **Promotion Blocker Info** — when competitive promotion doesn't fire, show why in alerts
5. **Finance Detail Modal** — clicking the finance section shows monthly breakdown (pay + BAH + BAS - expenses)
6. **MOS-specific events** — events that only fire for specific MOS fields (infantry, aviation, logistics, etc.)

---

## F. Known Issues / Bugs to Fix

| Issue | Status | Notes |
|-------|--------|-------|
| CSS specificity bug (game screen always visible) | ✅ Fixed | Removed `display:flex` from `#screen-game` |
| Reenlistment firing every turn | ✅ Fixed | `reenlistWindowOffered` flag added |
| Advance button visible before focus chosen | ✅ Fixed | `checkAdvanceReady()` called in `renderMonthlyChoices()` |
| `setMarried: false` in divorce event not in resolver | ✅ Fixed | Changed to `if (choice.setMarried !== undefined)` check |
| Promotion past E-4 (Cpl) never happened | ✅ Fixed | `focus_pme` choice + `_nextRequiredPME()` + `triggerSchoolSelect` handler |
| Stats max out with no negative pressure | ✅ Fixed | Natural decay added in `Career.monthlyDrift()` |
| Retirement pension too low (E-7 showed ~$1,050/mo) | ✅ Fixed | `Finance.RETIREMENT_BASE_PAY` table using 2024 DFAS 20-year values |
| End screen top cut off (justify-content: center) | ✅ Fixed | Changed to `flex-start` + `overflow-y: auto` |
| Play Again shows stale event cards as resolved | ✅ Fixed | `showGameScreen()` clears `_pendingEventChoices`, `_selectedFocuses`, event/alert containers |
| `minDebt` trigger condition missing from events roller | ✅ Fixed | Added `t.minDebt` check in `Events._meetsConditions()` |
| Unused `netWorth` variable lint warning in ui.js | ✅ Fixed | Removed declaration |
| Practice mode shows pre-range brief overlay | ✅ Fixed | `rq-prerange` explicitly hidden in `startPractice()` before `_showPositionIntro(0)` |

---

## G. File Quick Reference

```
Reenlistment Game/
├── plan.md                     ← THIS FILE
├── index.html
├── css/
│   ├── style.css               Entry point (@import all)
│   ├── base.css                Variables, reset, .screen
│   ├── screen-create.css       Title screen, buttons (.btn, .btn-primary/secondary/tertiary), character creation
│   ├── game-layout.css         Main game two-panel layout
│   ├── game-stats.css          Stat bars, track chips, finance section
│   ├── game-events.css         Event cards (cat-border-*, cat-*, chance-impact, chance-ack-btn)
│   ├── screen-misc.css         Decision modal, end state screen, civilian outlook panels
│   └── screen-rifle.css        Rifle qual mini-game (canvas, topbar, overlays, dist chip)
└── js/
    ├── main.js                 Screen routing, onAdvance(), showReserveDecision(), showPCSDecision(), btn-rifle-practice, btn-create-back
    ├── state.js                State singleton, save/load; orientationDismissed, easDecided flags
    ├── character.js            Marine model, BACKGROUNDS[], clamp(), name auto-capitalize, gender + pronouns
    ├── finance.js              Pay tables, RETIREMENT_BASE_PAY, runMonthly() (debt interest), deploymentBreakdown()
    ├── career.js               Promotions, SRB, civilianOutlook(), retirementProjection(), reserveRetirementPath()
    ├── pcs.js                  PCS.isPCSDue(), getOptions(), movingCost(), apply()
    ├── events.js               rollEvent(), rollEASPrepEvent(), resolveChoice(), _meetsConditions()
    ├── engine.js               Engine.runMonth() (EAS wind-down branch), MONTHLY_CHOICES[], focusBudget(), applyFocusChoice()
    ├── ui.js                   All DOM, END_STATES{} (Rank Last name format), renderEndOutlook(), _deployPayHtml()
    ├── rifle_qual.js           RifleQual — start(), startPractice(), _practiceMode, _updateTopbar() (dist chip YD)
    └── data/
        ├── mos.js              MOS_DATA[], MOS_FIELDS{}
        ├── assignments.js      ASSIGNMENTS_DATA[], BILLET_TIERS{}
        ├── promotions.js       RANKS[], PME_REQUIREMENTS{}, CONTRACT_LENGTHS[]
        ├── schools.js          SCHOOLS_DATA[]
        ├── events_core.js      Core events (deployment, career, personal, finance, discipline)
        ├── events_mos.js       MOS-field-specific events
        ├── events_chance.js    Chance events (isChance: true, single ACKNOWLEDGED button)
        ├── events_retirement.js Retirement-path events
        ├── events_eas.js       EAS wind-down events (isChance: true, cat-eas, sequential via rollEASPrepEvent)
        └── events_data.js      EVENTS_DATA[] assembler (spreads all event arrays)
```

---

## H. Session Log

| Session | Date | What Was Done |
|---------|------|---------------|
| 1 | Feb 2026 | Full project scaffolded — all 15 files, complete game loop |
| 2 | Feb 2026 | Fixed CSS visibility bug; game now opens on title screen |
| 3 | Feb 2026 | Quarterly turns, reenlistment fix, debt payoff, 30+ new events |
| 4 | Feb 2026 | Promotion fix (PME pathway), stat decay balance, dynamic choices (rank/deploy/injury gates), button text |
| 5 | Feb 2026 | PCS system (js/pcs.js), end-state outcome system (civilianOutlook/retirementProjection/reserveRetirementPath), SMCR/IRR reserve pathway with drill pay and pension formulas |
| 6 | Feb 2026 | Career log removed, end screen scroll fix, name capitalize + rank prefix, retirement pay fix (DFAS 2024 table), Play Again stale-events bug, debt interest (12% APR), debt escalation events ($2k/$5k/$10k thresholds) |
| 7 | Feb 2026 | Multi-select Bandwidth focus system; static panel divider; date corrected to 2026; title screen centering fix; male/female gender selection with pronoun helpers; event cards visually prominent (cat-border, white header, hover accent); promotion alerts gold/glowing (alert-promo); modal improvements (accent bar, larger icon); deployment destinations (deployLocations + chosenLocation injection); deployment tax-free pay table (Finance.deploymentBreakdown, TAX-FREE badges); first-turn orientation panel (dismissable, mobile tab tip, responsive labels) |
| 8 | Mar 2026 | End-state name format (Rank Last only, no first name); EAS wind-down system (easDecided flag, EVENTS_EAS pool with 6 sequential out-processing events, rollEASPrepEvent(), engine injection, PCS suppression, direct triggerEAS on contract expiry); EAS events styled as chance/acknowledge with cat-eas chip; rifle range practice mode (startPractice(), _practiceMode, title screen RIFLE RANGE button, btn-tertiary style, practice bug fix hiding rq-prerange); character creation back button with inline layout and directional arrows; distance chip on range header (dynamic, yards/YD throughout) |
