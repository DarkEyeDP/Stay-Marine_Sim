/* ═══════════════════════════════════════════════
   EVENTS DATA — Assembler
   Combines all event sections into EVENTS_DATA.
   Load order: events_core → events_mos → events_chance → events_retirement → this file
   ═══════════════════════════════════════════════ */

const EVENTS_DATA = [
  ...EVENTS_CORE,
  ...EVENTS_MOS,
  ...EVENTS_CHANCE,
  ...EVENTS_RETIREMENT,
];
