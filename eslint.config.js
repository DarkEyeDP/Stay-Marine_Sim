import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ASSIGNMENTS_DATA:     'readonly',
        BILLET_TIERS:         'readonly',
        CONTRACT_LENGTHS:     'readonly',
        EVENTS_CHANCE:        'readonly',
        EVENTS_CORE:          'readonly',
        EVENTS_DATA:          'readonly',
        EVENTS_DEPLOYED:      'readonly',
        EVENTS_EAS:           'readonly',
        EVENTS_MOS:           'readonly',
        EVENTS_RETIREMENT:    'readonly',
        GRADE_INDEX:          'readonly',
        MOS_DATA:             'readonly',
        MOS_FIELDS:           'readonly',
        PME_REQUIREMENTS:     'readonly',
        PROMOTION_WEIGHTS:    'readonly',
        RANKS:                'readonly',
        REENLISTMENT_WINDOWS: 'readonly',
        SCHOOLS_DATA:         'readonly',
        BACKGROUNDS:          'readonly',
        clamp:                'readonly',
        APP_VERSION:          'writable',
        Achievements:         'writable',
        Career:               'writable',
        Character:            'writable',
        Engine:               'writable',
        Events:               'writable',
        Finance:              'writable',
        Main:                 'writable',
        PCS:                  'writable',
        RifleQual:            'writable',
        State:                'writable',
        UI:                   'writable'
      }
    },
    rules: {
      'no-redeclare': ['error', { builtinGlobals: false }],
      'no-unused-vars': ['warn', { vars: 'local', args: 'none' }],
      'no-console': 'off',
      semi: ['warn', 'always'],
      eqeqeq: ['warn', 'always'],
      'no-empty': 'warn'
    }
  },
  {
    ignores: ['**/*.min.js', 'node_modules/']
  }
];
