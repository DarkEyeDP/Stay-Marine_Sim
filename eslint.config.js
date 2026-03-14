import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',
      globals: {
        // Browser environment (includes window, document, performance, etc.)
        ...globals.browser,

        // ── Data constants (defined in js/data/* and loaded via <script>) ──
        ASSIGNMENTS_DATA:    'readonly',
        BILLET_TIERS:        'readonly',
        CONTRACT_LENGTHS:    'readonly',
        EVENTS_CHANCE:       'readonly',
        EVENTS_CORE:         'readonly',
        EVENTS_DATA:         'readonly',
        EVENTS_EAS:          'readonly',
        EVENTS_MOS:          'readonly',
        EVENTS_RETIREMENT:   'readonly',
        GRADE_INDEX:         'readonly',
        MOS_DATA:            'readonly',
        MOS_FIELDS:          'readonly',
        PME_REQUIREMENTS:    'readonly',
        PROMOTION_WEIGHTS:   'readonly',
        RANKS:               'readonly',
        REENLISTMENT_WINDOWS:'readonly',
        SCHOOLS_DATA:        'readonly',
        BACKGROUNDS:         'readonly',

        // ── Utility (defined in engine.js) ──
        clamp:               'readonly',

        // ── Game objects (each file declares its own; others consume it) ──
        APP_VERSION: 'writable',
        Career:      'writable',
        Character:   'writable',
        Engine:      'writable',
        Events:      'writable',
        Finance:     'writable',
        Main:        'writable',
        PCS:         'writable',
        RifleQual:   'writable',
        State:       'writable',
        UI:          'writable',
      },
    },
    rules: {
      // Allow redeclaring globals — expected in a multi-script project
      'no-redeclare':   ['error', { builtinGlobals: false }],
      // Data files assign top-level consts consumed by other scripts
      'no-unused-vars': ['warn', { vars: 'local', args: 'none' }],
      'no-console':     'off',
      'semi':           ['warn', 'always'],
      'eqeqeq':         ['warn', 'always'],
      'no-empty':       'warn',
    },
  },
  {
    ignores: ['**/*.min.js', 'node_modules/'],
  },
];
