/* ═══════════════════════════════════════════════
   STATE MANAGER
   Single source of truth for the entire game.
   Auto-saves to localStorage after each month.
   ═══════════════════════════════════════════════ */

const SAVE_KEY = 'reenlistment_save_v1';

const State = {
  game: null,

  /** Create a fresh game state from a new Marine character */
  init(marine) {
    State.game = {
      marine,
      // Calendar — game starts in Jan 2026
      year: 2026,
      month: 1,
      // Pending decisions that must be resolved before advancing
      pendingDecision: null,
      // Events that fired this month (already displayed)
      monthEvents: [],
      // Career log entries [{date, text, major}]
      log: [],
      // Flags
      gameOver: false,
      endState: null,
      // Reenlistment — offered once per contract, reset after signing
      reenlistWindowOffered: false,
      // Recently fired event IDs (prevents same event repeating immediately)
      recentEventIds: [],
      // Orientation panel — shown once at game start
      orientationDismissed: false,
      // Rifle qualification — fires once per enlistment contract; reset on reenlist
      rifleQualCompleted: false,
      // EAS wind-down — true after player chooses EAS in the reenlistment window;
      // enables out-processing events and suppresses PCS/deployments until contract expires
      easDecided: false,
    };
    State.save();
  },

  save() {
    if (!State.game) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(State.game));
    } catch (e) {
      console.warn('Save failed:', e);
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      State.game = JSON.parse(raw);
      return true;
    } catch (e) {
      console.warn('Load failed:', e);
      return false;
    }
  },

  hasSave() {
    return !!localStorage.getItem(SAVE_KEY);
  },

  clearSave() {
    localStorage.removeItem(SAVE_KEY);
    State.game = null;
  },

  /** Convenience getter */
  get m() { return State.game.marine; },

  /** Add a career log entry */
  log(text, major = false) {
    const date = `${State.game.year}-${String(State.game.month).padStart(2,'0')}`;
    State.game.log.unshift({ date, text, major });
    // Keep last 100 entries
    if (State.game.log.length > 100) State.game.log.pop();
  },

  /** Advance calendar by one month */
  advanceMonth() {
    State.game.month++;
    if (State.game.month > 12) {
      State.game.month = 1;
      State.game.year++;
    }
  },
};
