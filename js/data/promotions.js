/* ═══════════════════════════════════════════════
   PROMOTION DATA
   Marine Corps enlisted promotion structure
   ═══════════════════════════════════════════════ */

const RANKS = [
  { grade: 'E-1', abbr: 'Pvt',   title: 'Private',               tisMins: 0,   tigMins: 0  },
  { grade: 'E-2', abbr: 'PFC',   title: 'Private First Class',   tisMins: 6,   tigMins: 4  },
  { grade: 'E-3', abbr: 'LCpl',  title: 'Lance Corporal',        tisMins: 14,  tigMins: 8  },
  { grade: 'E-4', abbr: 'Cpl',   title: 'Corporal',              tisMins: 24,  tigMins: 12, requiresBoard: false, requiresScore: true },
  { grade: 'E-5', abbr: 'Sgt',   title: 'Sergeant',              tisMins: 36,  tigMins: 18, requiresBoard: false, requiresScore: true },
  { grade: 'E-6', abbr: 'SSgt',  title: 'Staff Sergeant',        tisMins: 84,  tigMins: 36, requiresBoard: false, requiresScore: true },
  { grade: 'E-7', abbr: 'GySgt', title: 'Gunnery Sergeant',      tisMins: 144, tigMins: 48, requiresBoard: true  },
  { grade: 'E-8', abbr: 'MSgt',  title: 'Master Sergeant',       tisMins: 180, tigMins: 36, requiresBoard: true  },
  { grade: 'E-8', abbr: '1stSgt',title: 'First Sergeant',        tisMins: 180, tigMins: 36, requiresBoard: true, isBilletGrade: true },
  { grade: 'E-9', abbr: 'MGySgt',title: 'Master Gunnery Sergeant',tisMins: 240, tigMins: 48, requiresBoard: true },
  { grade: 'E-9', abbr: 'SgtMaj',title: 'Sergeant Major',        tisMins: 240, tigMins: 48, requiresBoard: true, isBilletGrade: true },
];

// Grade index for easy lookup (0 = E-1)
const GRADE_INDEX = {
  'E-1': 0, 'E-2': 1, 'E-3': 2, 'E-4': 3, 'E-5': 4,
  'E-6': 5, 'E-7': 6, 'E-8': 7, 'E-9': 9,
};

// Base promotion score weights
const PROMOTION_WEIGHTS = {
  physicalFitness:  0.20,
  profConduct:      0.30,
  mosProficiency:   0.15,
  pmeCompleted:     0.20, // scaled by number of PME items
  billetTier:       0.10, // scaled 1-5
  awardsBonus:      0.05, // capped contribution
};

// PME requirements by grade (min PME to be eligible)
const PME_REQUIREMENTS = {
  'E-4': [],
  'E-5': ['Marine Net: Cpl Course'],
  'E-6': ['Marine Net: Cpl Course', 'Sergeant\'s Course'],
  'E-7': ['Marine Net: Cpl Course', 'Sergeant\'s Course', 'Career Course'],
  'E-8': ['Marine Net: Cpl Course', 'Sergeant\'s Course', 'Career Course', 'SNCO Academy (resident)'],
  'E-9': ['Marine Net: Cpl Course', 'Sergeant\'s Course', 'Career Course', 'SNCO Academy (resident)', 'SgtMaj Academy'],
};

// Reenlistment windows (months of TIS when the window opens)
const REENLISTMENT_WINDOWS = [
  { tisMins: 36,  label: '1st Reenlistment', maxSRB: 45000 },
  { tisMins: 84,  label: '2nd Reenlistment', maxSRB: 30000 },
  { tisMins: 144, label: '3rd Reenlistment',  maxSRB: 20000 },
  { tisMins: 192, label: '4th Reenlistment',  maxSRB: 10000 },
  { tisMins: 228, label: '5th Reenlistment',  maxSRB: 0     },
];

// Contract lengths available at reenlistment
const CONTRACT_LENGTHS = [2, 3, 4, 5, 6];
