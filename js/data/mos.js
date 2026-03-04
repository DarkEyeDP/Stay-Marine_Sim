/* ═══════════════════════════════════════════════
   MOS DATA
   Each MOS has: id, code, title, field, description,
   startingStats (adjustments), optempo, civilianValue
   ═══════════════════════════════════════════════ */
const MOS_DATA = [
  // ── INFANTRY (03) ──────────────────────────────
  {
    id: 'mos_0311',
    code: '0311',
    title: 'Rifleman',
    field: 'infantry',
    description: 'The backbone of the Marine Corps. You close with and destroy the enemy. High optempo, high stress, elite camaraderie.',
    startingStats: { physicalFitness: 10, mosProficiency: 5, stress: 5, familyStability: -5 },
    optempo: 4,
    civilianValue: 40,
    pmeBonus: false,
  },
  {
    id: 'mos_0331',
    code: '0331',
    title: 'Machine Gunner',
    field: 'infantry',
    description: 'Operate and maintain M240, M2, and Mk19 crew-served weapons. Physically demanding with a tight-knit community.',
    startingStats: { physicalFitness: 10, mosProficiency: 5, stress: 5 },
    optempo: 4,
    civilianValue: 35,
    pmeBonus: false,
  },
  {
    id: 'mos_0341',
    code: '0341',
    title: 'Mortarman',
    field: 'infantry',
    description: 'Fire support for the infantry platoon. You master the 60mm and 81mm mortar systems.',
    startingStats: { physicalFitness: 8, mosProficiency: 5, stress: 4 },
    optempo: 4,
    civilianValue: 35,
    pmeBonus: false,
  },

  // ── INTELLIGENCE (02) ──────────────────────────
  {
    id: 'mos_0231',
    code: '0231',
    title: 'Intelligence Specialist',
    field: 'intelligence',
    description: 'Collect, analyze, and report intelligence. Strong career transition to federal agencies and defense contractors.',
    startingStats: { mosProficiency: 5, civilianEmployability: 10, stress: 2 },
    optempo: 2,
    civilianValue: 75,
    pmeBonus: false,
  },

  // ── LOGISTICS / SUPPLY (04) ───────────────────
  {
    id: 'mos_0411',
    code: '0411',
    title: 'Maintenance Management Specialist',
    field: 'logistics',
    description: 'Track, schedule, and manage equipment maintenance across the unit. Excellent DOD contractor pathway.',
    startingStats: { mosProficiency: 5, savings: 200, civilianEmployability: 8 },
    optempo: 2,
    civilianValue: 65,
    pmeBonus: false,
  },

  // ── COMMUNICATIONS (06) ──────────────────────
  {
    id: 'mos_0651',
    code: '0651',
    title: 'Network Administrator',
    field: 'communications',
    description: 'Install, configure, and maintain Marine Corps networks and communications systems. Transfers directly to IT sector.',
    startingStats: { mosProficiency: 5, civilianEmployability: 12, stress: 1 },
    optempo: 2,
    civilianValue: 80,
    pmeBonus: false,
  },
  {
    id: 'mos_0621',
    code: '0621',
    title: 'Field Radio Operator',
    field: 'communications',
    description: 'Operate communications equipment in the field alongside maneuver elements. High optempo when attached to grunt units.',
    startingStats: { physicalFitness: 5, mosProficiency: 5, stress: 3 },
    optempo: 3,
    civilianValue: 55,
    pmeBonus: false,
  },

  // ── ADMIN / FINANCE (01) ─────────────────────
  {
    id: 'mos_0111',
    code: '0111',
    title: 'Administrative Specialist',
    field: 'admin',
    description: 'Maintain personnel records, process administrative actions, support unit headquarters. Lower physical demand, high attention to detail.',
    startingStats: { mosProficiency: 5, familyStability: 5, stress: -2 },
    optempo: 1,
    civilianValue: 55,
    pmeBonus: false,
  },
  {
    id: 'mos_3432',
    code: '3432',
    title: 'Financial Management Technician',
    field: 'admin',
    description: 'Manage Marine Corps payroll, travel pay, and unit budgets. Finance and accounting experience is highly transferable.',
    startingStats: { mosProficiency: 5, savings: 500, civilianEmployability: 10 },
    optempo: 1,
    civilianValue: 70,
    pmeBonus: false,
  },

  // ── MOTOR TRANSPORT (35) ─────────────────────
  {
    id: 'mos_3521',
    code: '3521',
    title: 'Automotive Organizational Mechanic',
    field: 'motor_t',
    description: 'Maintain and repair tactical vehicles from HMMWVs to 7-tons. CDL-transferable skills and strong civilian market.',
    startingStats: { mosProficiency: 5, civilianEmployability: 8 },
    optempo: 3,
    civilianValue: 60,
    pmeBonus: false,
  },
  {
    id: 'mos_3531',
    code: '3531',
    title: 'Motor Vehicle Operator',
    field: 'motor_t',
    description: 'Drive and operate tactical vehicles in support of Marine operations. CDL attainable, good civilian truck driving pathway.',
    startingStats: { mosProficiency: 5, civilianEmployability: 6 },
    optempo: 3,
    civilianValue: 55,
    pmeBonus: false,
  },

  // ── AVIATION (60) ────────────────────────────
  {
    id: 'mos_6048',
    code: '6048',
    title: 'Flight Equipment Technician',
    field: 'aviation',
    description: 'Maintain survival equipment, parachutes, and flight gear. Work alongside aircrew in aviation units.',
    startingStats: { mosProficiency: 5, civilianEmployability: 7 },
    optempo: 2,
    civilianValue: 60,
    pmeBonus: false,
  },
  {
    id: 'mos_6152',
    code: '6152',
    title: 'Aircraft Rescue & Firefighting Specialist',
    field: 'aviation',
    description: 'Provide crash fire rescue at Marine Corps air stations. ARFF certification transfers directly to civilian airport firefighting.',
    startingStats: { physicalFitness: 8, mosProficiency: 5, civilianEmployability: 12 },
    optempo: 2,
    civilianValue: 72,
    pmeBonus: false,
  },

  // ── MP / LAW ENFORCEMENT (58) ────────────────
  {
    id: 'mos_5811',
    code: '5811',
    title: 'Military Police',
    field: 'law_enforcement',
    description: 'Enforce law and order, conduct investigations, control traffic. Law enforcement background strong for civilian policing.',
    startingStats: { mosProficiency: 5, profConduct: 5, civilianEmployability: 10 },
    optempo: 2,
    civilianValue: 68,
    pmeBonus: false,
  },

  // ── ARTILLERY (08) ────────────────────────────
  {
    id: 'mos_0811',
    code: '0811',
    title: 'Field Artillery Cannoneer',
    field: 'artillery',
    description: 'Operate and maintain artillery weapons systems including the M777 Howitzer. Tough physical job with strong unit identity.',
    startingStats: { physicalFitness: 8, mosProficiency: 5, stress: 4 },
    optempo: 3,
    civilianValue: 40,
    pmeBonus: false,
  },
  {
    id: 'mos_0844',
    code: '0844',
    title: 'Fire Control Marine',
    field: 'artillery',
    description: 'Operate fire control systems and coordinate with maneuver elements for fire support. Technical skill with leadership potential.',
    startingStats: { mosProficiency: 8, civilianEmployability: 6 },
    optempo: 3,
    civilianValue: 50,
    pmeBonus: false,
  },
];

const MOS_FIELDS = {
  infantry:       { label: 'Infantry',        color: '#e53935' },
  intelligence:   { label: 'Intelligence',    color: '#42a5f5' },
  logistics:      { label: 'Logistics',       color: '#f0b429' },
  communications: { label: 'Communications',  color: '#66bb6a' },
  admin:          { label: 'Admin/Finance',   color: '#ab47bc' },
  motor_t:        { label: 'Motor T',         color: '#26a69a' },
  aviation:       { label: 'Aviation',        color: '#78909c' },
  law_enforcement:{ label: 'Law Enforcement', color: '#5c6bc0' },
  artillery:      { label: 'Artillery',       color: '#ff7043' },
};
