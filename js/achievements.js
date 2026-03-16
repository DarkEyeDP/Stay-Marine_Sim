/* ===============================================
   ACHIEVEMENTS
   Persistent meta-progression stored separately
   from the active career save.
   =============================================== */

const ACHIEVEMENTS_KEY = 'reenlistment_achievements_v2';

const TIER_ORDER = ['issued', 'earned', 'hard_charged', 'blood_stripe', 'legend'];
const TIER_LABELS = {
  issued: 'Issued',
  earned: 'Earned',
  hard_charged: 'Hard-Charged',
  blood_stripe: 'Blood Stripe',
  legend: 'Legend'
};

const ACHIEVEMENT_DEFS = [
  { id: 'welcome_aboard', title: 'Welcome Aboard', tier: 'issued', desc: 'You signed. The machine is now aware of you.', iconifyIcon: 'mdi:account-plus-outline' },
  { id: 'boot_phase_complete', title: 'Boot Phase Complete', tier: 'issued', desc: 'You survived the part where everyone yells.', iconifyIcon: 'mdi:badge-account-horizontal-outline' },
  { id: 'mustang_incident', title: 'The Mustang Incident', tier: 'issued', desc: '19% APR builds character.', iconifyIcon: 'mdi:car-arrow-right' },
  { id: 'two_paychecks_still_broke', title: 'Two Paychecks, Still Broke', tier: 'issued', desc: 'Finance says it is a you problem.', iconifyIcon: 'mdi:cash-remove' },
  { id: 'energy_drink_logistics', title: 'Energy Drink Logistics', tier: 'issued', desc: 'This is your supply chain.', iconifyIcon: 'mdi:lightning-bolt-outline' },
  { id: 'barracks_maintenance_tech', title: 'Barracks Maintenance Tech', tier: 'issued', desc: 'You can fix anything with tape and spite.', iconifyIcon: 'mdi:tools' },

  { id: 'four_year_any_percent', title: '4-Year Any%', tier: 'earned', desc: 'Blink twice and you are at CIF.', iconifyIcon: 'mdi:timer-outline' },
  { id: 'speed_bump_career', title: 'Speed Bump Career', tier: 'earned', desc: 'Some careers are a journey. This one was an exit ramp.', iconifyIcon: 'mdi:fast-forward-outline' },
  { id: 'barracks_king', title: 'Barracks King', tier: 'earned', desc: 'No dependas. No drama. Just field day.', iconifyIcon: 'mdi:bunk-bed-outline' },
  { id: 'first_reenlistment', title: 'First Reenlistment', tier: 'earned', desc: 'You signed again. The plot thickens.', iconifyIcon: 'mdi:clipboard-text-clock-outline' },
  { id: 'honorable_eas', title: 'Honorable EAS', tier: 'earned', desc: 'You left on your terms.', iconifyIcon: 'mdi:file-certificate-outline' },
  { id: 'fire_team_lead', title: 'Fire Team Lead', tier: 'earned', desc: 'Congrats. You now own someone else\'s mistakes.', iconifyIcon: 'mdi:account-group-outline' },
  { id: 'schoolhouse_ghost', title: 'Schoolhouse Ghost', tier: 'earned', desc: 'You live in classrooms now.', iconifyIcon: 'mdi:school-outline' },
  { id: 'qualified_marksman', title: 'Qualified: Marksman', tier: 'earned', desc: 'Not pretty, but it counts.', iconifyIcon: 'mdi:target-variant' },
  { id: 'high_first_class', title: 'High First Class', tier: 'earned', desc: 'Run time says do not talk to me.', iconifyIcon: 'mdi:run-fast' },
  { id: 'new_duty_station', title: 'New Duty Station', tier: 'earned', desc: 'Fresh map. Same chaos.', iconifyIcon: 'mdi:map-marker-path' },
  { id: 'camp_lejeune_hydration_program', title: 'Camp Lejeune Hydration Program', tier: 'earned', desc: 'Eligible for a future class action, maybe.', iconifyIcon: 'mdi:water-alert-outline' },
  { id: 'pendleton_regular', title: 'Pendleton Regular', tier: 'earned', desc: 'You can smell the ocean and the op order.', iconifyIcon: 'mdi:waves' },
  { id: 'palms_sun_touched', title: '29 Palms Sun Touched', tier: 'earned', desc: 'Your car interior is now a stovetop.', iconifyIcon: 'mdi:white-balance-sunny' },
  { id: 'okinawa_liberty_expert', title: 'Okinawa Liberty Expert', tier: 'earned', desc: 'You know the curfew math.', iconifyIcon: 'mdi:palm-tree' },
  { id: 'quantico_paper_warrior', title: 'Quantico Paper Warrior', tier: 'earned', desc: 'You became PowerPoint.', iconifyIcon: 'mdi:presentation' },
  { id: 'kaneohe_bay_breeze', title: 'Kaneohe Bay Breeze', tier: 'earned', desc: 'You cannot be sad in Hawaii. You can try.', iconifyIcon: 'mdi:island' },
  { id: 'uniform_inspection_pass', title: 'Uniform Inspection Pass', tier: 'earned', desc: 'One thread away from disaster.', iconifyIcon: 'mdi:check-decagram-outline' },

  { id: 'retirement_any_percent', title: 'Retirement Any%', tier: 'hard_charged', desc: 'You skipped the plot and went straight to paperwork.', iconifyIcon: 'mdi:timer-star-outline' },
  { id: 'never_paid_it_off', title: 'Never Paid It Off', tier: 'hard_charged', desc: 'You carried that debt like a rifle.', iconifyIcon: 'mdi:credit-card-clock-outline' },
  { id: 'clean_record', title: 'Clean Record', tier: 'hard_charged', desc: 'No NJP. No drama. Just results.', iconifyIcon: 'mdi:file-check-outline' },
  { id: 'the_long_game', title: 'The Long Game', tier: 'hard_charged', desc: 'You did not just stay. You built a career.', iconifyIcon: 'mdi:timeline-check-outline' },
  { id: 'careerist', title: 'Careerist', tier: 'hard_charged', desc: 'You stopped counting days and started counting years.', iconifyIcon: 'mdi:calendar-range' },
  { id: 'qualified_sharpshooter', title: 'Qualified: Sharpshooter', tier: 'hard_charged', desc: 'Hold off, hold steady, send it.', iconifyIcon: 'mdi:crosshairs-gps' },
  { id: 'wind_whisperer', title: 'Wind Whisperer', tier: 'hard_charged', desc: 'You aimed where the bullet needed to be.', iconifyIcon: 'mdi:weather-windy' },
  { id: 'perfect_card_prone_kneeling', title: 'Perfect Card: Prone + Kneeling', tier: 'hard_charged', desc: 'You did the easy hard parts.', iconifyIcon: 'mdi:crosshairs' },
  { id: 'standing_on_business', title: 'Standing On Business', tier: 'hard_charged', desc: 'Your wobble did not own you.', iconifyIcon: 'mdi:human-handsup' },
  { id: 'the_comeback_shot', title: 'The Comeback', tier: 'hard_charged', desc: 'You were in the dirt. Then you locked in.', iconifyIcon: 'mdi:trending-up' },
  { id: 'section_lead', title: 'Section Lead', tier: 'hard_charged', desc: 'You are the plan and the backup plan.', iconifyIcon: 'mdi:account-supervisor-outline' },
  { id: 'professional_student', title: 'Professional Student', tier: 'hard_charged', desc: 'You turned caffeine into credentials.', iconifyIcon: 'mdi:certificate-outline' },
  { id: 'debt_free_eas', title: 'Debt-Free EAS', tier: 'hard_charged', desc: 'Civilian life starts on easy mode.', iconifyIcon: 'mdi:piggy-bank' },
  { id: 'smcr_encore', title: 'SMCR Encore', tier: 'hard_charged', desc: 'You did not leave. You just changed tempo.', iconifyIcon: 'mdi:account-arrow-right-outline' },
  { id: 'quiet_professional', title: 'The Quiet Professional', tier: 'hard_charged', desc: 'No drama. Just unstoppable.', iconifyIcon: 'mdi:account-tie-voice-off-outline' },
  { id: 'combat_ready', title: 'Combat Ready', tier: 'hard_charged', desc: 'You fall to your training.', iconifyIcon: 'mdi:shield-check-outline' },

  { id: 'one_point_short', title: 'One Point Short', tier: 'blood_stripe', desc: 'You will remember this forever.', iconifyIcon: 'mdi:minus-circle-outline' },
  { id: 'blood_stripe', title: 'Blood Stripe', tier: 'blood_stripe', desc: 'Welcome to the NCO tier. Now you are responsible.', iconifyIcon: 'mdi:chevron-up-box-outline' },
  { id: 'expert_rifleman', title: 'Expert Rifleman', tier: 'blood_stripe', desc: 'Clean, calm, surgical.', iconifyIcon: 'mdi:target-account' },
  { id: 'expert_or_bust', title: 'Expert or Bust', tier: 'blood_stripe', desc: 'You did not come to participate.', iconifyIcon: 'mdi:star-shooting-outline' },
  { id: 'pits_dont_sleep', title: 'Pits Don\'t Sleep', tier: 'blood_stripe', desc: 'They are tired of seeing your targets.', iconifyIcon: 'mdi:bullseye-arrow' },
  { id: 'distinguished', title: 'Distinguished (Not Today, Satan)', tier: 'blood_stripe', desc: 'The pits started taking notes.', iconifyIcon: 'mdi:trophy-award' },
  { id: 'the_professional', title: 'The Professional', tier: 'blood_stripe', desc: 'Not flashy. Just unstoppable.', iconifyIcon: 'mdi:briefcase-account-outline' },
  { id: 'stack_builder', title: 'Stack Builder', tier: 'blood_stripe', desc: 'Your chest looks like a resume.', iconifyIcon: 'mdi:medal' },
  { id: 'smooth_transition', title: 'Smooth Transition', tier: 'blood_stripe', desc: 'You planned like an adult.', iconifyIcon: 'mdi:briefcase-check-outline' },
  { id: 'unq_redemption_arc', title: 'UNQ Redemption Arc', tier: 'blood_stripe', desc: 'From embarrassment to poster child.', iconifyIcon: 'mdi:restore-alert' },
  { id: 'the_comeback_tour', title: 'The Comeback Tour', tier: 'blood_stripe', desc: 'Plot armor earned.', iconifyIcon: 'mdi:arrow-u-up-left-bold' },

  { id: 'standing_god_mode', title: 'Standing God Mode', tier: 'legend', desc: 'This is either skill or witchcraft.', iconifyIcon: 'mdi:lightning-bolt' },
  { id: 'the_perfect_card', title: 'The Perfect Card', tier: 'legend', desc: 'Be honest. Who is mouse-clicking for you?', iconifyIcon: 'mdi:crown' },
  { id: 'staff_nco_energy', title: 'Staff NCO Energy', tier: 'legend', desc: 'People stop asking if you are serious.', iconifyIcon: 'mdi:account-star-outline' },
  { id: 'gunny_time', title: 'Gunny Time', tier: 'legend', desc: 'You have entered because I said so.', iconifyIcon: 'mdi:account-hard-hat-outline' },
  { id: 'twenty_years_of_damage', title: 'Twenty Years of Damage', tier: 'legend', desc: 'You made it. You paid for it. You won.', iconifyIcon: 'mdi:medal-outline' },
  { id: 'retired_with_knees', title: 'Retired With Knees (Impossible)', tier: 'legend', desc: 'Medical would like a word.', iconifyIcon: 'mdi:run' },
  { id: 'perfect_run', title: 'Perfect Run', tier: 'legend', desc: 'This is propaganda.', iconifyIcon: 'mdi:crown-outline' },
  { id: 'legendary_consistency', title: 'Legendary Consistency', tier: 'legend', desc: 'You never slipped. Not once.', iconifyIcon: 'mdi:infinity' },
  { id: 'the_standard', title: 'The Standard', tier: 'legend', desc: 'Other Marines got compared to you.', iconifyIcon: 'mdi:star-circle-outline' }
];

const RANK_ACHIEVEMENTS = [
  { id: 'rank_pfc', grade: 'E-2', title: 'Private First Class', shortTitle: 'PFC', desc: 'Reach Private First Class.', asset: 'pfc-rank.svg', tier: 'issued' },
  { id: 'rank_lcpl', grade: 'E-3', title: 'Lance Corporal', shortTitle: 'LCpl', desc: 'Reach Lance Corporal.', asset: 'lcpl-rank.svg', tier: 'issued' },
  { id: 'rank_cpl', grade: 'E-4', title: 'Corporal', shortTitle: 'Cpl', desc: 'Reach Corporal.', asset: 'cpl-rank.svg', tier: 'blood_stripe' },
  { id: 'rank_sgt', grade: 'E-5', title: 'Sergeant', shortTitle: 'Sgt', desc: 'Reach Sergeant.', asset: 'sgt-rank.svg', tier: 'earned' }
];

const STATION_BADGES = {
  assign_pendleton: 'pendleton_regular',
  assign_lejeune: 'camp_lejeune_hydration_program',
  assign_29palms: 'palms_sun_touched',
  assign_okinawa: 'okinawa_liberty_expert',
  assign_quantico: 'quantico_paper_warrior',
  assign_kaneohe: 'kaneohe_bay_breeze'
};

const UNLOCK_HINTS = {
  welcome_aboard: 'Start your first run.',
  boot_phase_complete: 'Complete boot camp and earn the title Marine.',
  mustang_incident: 'Take on the early-career car loan.',
  two_paychecks_still_broke: 'Get married while in debt and stay in debt for 6 months.',
  energy_drink_logistics: 'Stay under heavy stress for 6 straight months.',
  barracks_maintenance_tech: 'Pass a barracks inspection event.',
  four_year_any_percent: 'Finish a first contract in 5 real-time minutes or less.',
  speed_bump_career: 'Finish any career in 3 real-time minutes or less.',
  barracks_king: 'Finish a first contract without ever getting married.',
  first_reenlistment: 'Reenlist once.',
  honorable_eas: 'EAS with solid leadership reputation.',
  fire_team_lead: 'Promote to Corporal.',
  schoolhouse_ghost: 'Complete a school orders event.',
  qualified_marksman: 'Qualify as Marksman on the rifle range.',
  high_first_class: 'Hit a high first-class fitness bracket.',
  new_duty_station: 'PCS to a new duty station.',
  camp_lejeune_hydration_program: 'Get stationed at Camp Lejeune.',
  pendleton_regular: 'Get stationed at Camp Pendleton.',
  palms_sun_touched: 'Get stationed at 29 Palms.',
  okinawa_liberty_expert: 'Get stationed in Okinawa.',
  quantico_paper_warrior: 'Get stationed at Quantico.',
  kaneohe_bay_breeze: 'Get stationed in Hawaii.',
  uniform_inspection_pass: 'Pass an inspection event.',
  retirement_any_percent: 'Reach retirement in 10 real-time minutes or less.',
  never_paid_it_off: 'Finish a contract without ever paying debt down to zero.',
  clean_record: 'Finish a clean contract with no major setbacks or NJP.',
  the_long_game: 'Reenlist twice and start a third contract.',
  careerist: 'Reach careerist service length.',
  qualified_sharpshooter: 'Qualify as Sharpshooter on the rifle range.',
  wind_whisperer: 'Score a bullseye in moderate or strong wind.',
  perfect_card_prone_kneeling: 'Score all 5s in both prone and kneeling in the same qualification.',
  standing_on_business: 'In standing, score no 0s and at least three shots of 4 or higher.',
  the_comeback_shot: 'Start any string with a 0 or 1, then end that same string with back-to-back 5s.',
  one_point_short: 'Finish with a total score of exactly 64 — one point below Expert.',
  standing_god_mode: 'Score all 5s in the standing string.',
  the_perfect_card: 'Score all 15 shots as 5 — a perfect 75/75.',
  section_lead: 'Hold section-level leadership long enough to earn it.',
  professional_student: 'Stack enough school completions while active.',
  debt_free_eas: 'EAS with zero debt and at least ,000 saved.',
  smcr_encore: 'Finish your career in the SMCR.',
  quiet_professional: 'Sustain high reputation with low drama over time.',
  combat_ready: 'Hit elite readiness thresholds at the same time.',
  blood_stripe: 'Promote to Corporal.',
  expert_rifleman: 'Qualify as Expert on the rifle range.',
  expert_or_bust: 'Earn Expert on your first qualification of the run.',
  pits_dont_sleep: 'Shoot 3 consecutive bullseyes during qualification.',
  distinguished: 'Post a near-perfect rifle score.',
  the_professional: 'Finish a contract with elite fitness, reputation, and PME progress.',
  stack_builder: 'Earn at least 4 awards in a single run.',
  smooth_transition: 'Reach the smooth civilian transition ending.',
  unq_redemption_arc: 'Shoot UNQ once, then later qualify Expert in the same run.',
  the_comeback_tour: 'Recover from a setback and still finish strong.',
  staff_nco_energy: 'Promote to Staff Sergeant.',
  gunny_time: 'Promote to Gunnery Sergeant.',
  twenty_years_of_damage: 'Retire after 20 years of service.',
  retired_with_knees: 'Retire with unusually low injury wear.',
  perfect_run: 'Retire with elite shooting, fitness, reputation, and no major setbacks.',
  legendary_consistency: 'Maintain elite performance for years.',
  the_standard: 'Hold top-tier leadership with top-tier stats.'
};
const Achievements = {
  profile: null,

  init() {
    Achievements.profile = Achievements._loadProfile();
    return Achievements.profile;
  },

  ensureProfile() {
    if (!Achievements.profile) Achievements.init();
    return Achievements.profile;
  },

  ensureRunState(game) {
    if (!game) return null;
    if (!game.achievementFlags) game.achievementFlags = {};
    const flags = game.achievementFlags;
    if (!flags.rankRecorded) flags.rankRecorded = {};
    if (!flags.stationsVisited) flags.stationsVisited = [];
    if (!flags.runStartedAt) flags.runStartedAt = Date.now();
    if (typeof flags.careerCompleted !== 'boolean') flags.careerCompleted = false;
    if (typeof flags.deploymentRecorded !== 'boolean') flags.deploymentRecorded = false;
    if (typeof flags.reenlistmentsThisRun !== 'number') flags.reenlistmentsThisRun = 0;
    if (typeof flags.highStressMonths !== 'number') flags.highStressMonths = 0;
    if (typeof flags.marriedDebtMonths !== 'number') flags.marriedDebtMonths = 0;
    if (typeof flags.sectionLeadMonths !== 'number') flags.sectionLeadMonths = 0;
    if (typeof flags.quietProfessionalMonths !== 'number') flags.quietProfessionalMonths = 0;
    if (typeof flags.everMarried !== 'boolean') flags.everMarried = !!game.marine?.isMarried;
    if (typeof flags.everDebtZero !== 'boolean') flags.everDebtZero = (game.marine?.debt || 0) <= 0;
    if (typeof flags.debtStartedPositive !== 'boolean') flags.debtStartedPositive = (game.marine?.debt || 0) > 0;
    if (typeof flags.firstQualResult !== 'string' && flags.firstQualResult !== null) flags.firstQualResult = null;
    if (typeof flags.hadUNQ !== 'boolean') flags.hadUNQ = false;
    if (typeof flags.highWindBullseye !== 'boolean') flags.highWindBullseye = false;
    if (typeof flags.consecutiveBullseyes !== 'number') flags.consecutiveBullseyes = 0;
    if (typeof flags.maxConsecutiveBullseyes !== 'number') flags.maxConsecutiveBullseyes = 0;
    if (typeof flags.hadMajorSetback !== 'boolean') flags.hadMajorSetback = false;
    if (typeof flags.schoolCount !== 'number') flags.schoolCount = 0;
    if (typeof flags.peakFitness !== 'number') flags.peakFitness = game.marine?.physicalFitness || 0;
    return flags;
  },

  recordCareerStart(game) {
    const profile = Achievements.ensureProfile();
    const flags = Achievements.ensureRunState(game);
    profile.stats.careersStarted += 1;
    Achievements.unlock('welcome_aboard');
    if (game?.marine?.assignmentId) Achievements.recordAssignment(game, game.marine.assignmentId, false);
    flags.lastPhysicalFitness = game?.marine?.physicalFitness || 0;
    Achievements._saveProfile();
  },

  recordMarineTitle(marine) {
    Achievements.unlock('boot_phase_complete');
    Achievements.evaluateMarine(State.game, marine);
  },

  recordPromotion(game, marine, newGrade) {
    const profile = Achievements.ensureProfile();
    const flags = Achievements.ensureRunState(game);
    if (!flags || flags.rankRecorded[newGrade]) return;

    flags.rankRecorded[newGrade] = true;
    profile.stats.promotions += 1;

    const rankDef = RANK_ACHIEVEMENTS.find(rank => rank.grade === newGrade);
    if (rankDef) {
      profile.rankCounts[newGrade] = (profile.rankCounts[newGrade] || 0) + 1;
      Achievements.unlock(rankDef.id);
    }

    profile.stats.highestRank = Achievements._higherRank(profile.stats.highestRank, newGrade);

    if (newGrade === 'E-4') {
      Achievements.unlock('blood_stripe');
      Achievements.unlock('fire_team_lead');
    }
    if (newGrade === 'E-6') Achievements.unlock('staff_nco_energy');
    if (newGrade === 'E-7') Achievements.unlock('gunny_time');

    Achievements.evaluateMarine(game, marine);
    Achievements._saveProfile();
  },

  recordReenlistment(marine) {
    const profile = Achievements.ensureProfile();
    const flags = Achievements.ensureRunState(State.game);
    profile.stats.reenlistments += 1;
    flags.reenlistmentsThisRun += 1;
    Achievements.unlock('first_reenlistment');
    if (flags.reenlistmentsThisRun >= 2) Achievements.unlock('the_long_game');
    Achievements.evaluateMarine(State.game, marine);
    Achievements._saveProfile();
  },

  recordDeployment(game, marine) {
    const profile = Achievements.ensureProfile();
    const flags = Achievements.ensureRunState(game);
    if (flags && flags.deploymentRecorded) return;
    if (flags) flags.deploymentRecorded = true;
    profile.stats.deployments += 1;
    Achievements.evaluateMarine(game, marine);
    Achievements._saveProfile();
  },

  recordAssignment(game, assignmentId, moved) {
    const flags = Achievements.ensureRunState(game);
    if (!assignmentId) return;
    if (!flags.stationsVisited.includes(assignmentId)) flags.stationsVisited.push(assignmentId);
    const badgeId = STATION_BADGES[assignmentId];
    if (badgeId) Achievements.unlock(badgeId);
    if (moved) Achievements.unlock('new_duty_station');
    Achievements._saveProfile();
  },

  recordEventResolution(game, marine, evt, choiceIndex, choice) {
    if (!evt || !choice) return;
    const flags = Achievements.ensureRunState(game);

    if (evt.id === 'evt_school_orders' && choiceIndex === 0) {
      flags.schoolCount += 1;
      Achievements.unlock('schoolhouse_ghost');
    }
    if (evt.id === 'evt_inspection' && choiceIndex === 0) {
      Achievements.unlock('uniform_inspection_pass');
    }
    if (evt.id === 'evt_barracks_inspection' && choiceIndex === 0) {
      Achievements.unlock('barracks_maintenance_tech');
    }
    if (evt.id === 'evt_marriage' && choice.setMarried) {
      flags.everMarried = true;
    }
    if (choice.buyNewCar && (marine.pendingCarLoanReveal || marine.carLoanMonthsLeft > 0)) {
      Achievements.unlock('mustang_incident');
      flags.hadMajorSetback = true;
    }

    Achievements.evaluateMarine(game, marine);
  },

  recordFocusChoice(game, choiceId) {
    const marine = game?.marine;
    if (!marine) return;
    Achievements.evaluateMarine(game, marine);
  },

  recordRifleShot(game, score, wind) {
    const flags = Achievements.ensureRunState(game);
    if (score >= 5) {
      flags.consecutiveBullseyes += 1;
      flags.maxConsecutiveBullseyes = Math.max(flags.maxConsecutiveBullseyes, flags.consecutiveBullseyes);
    } else {
      flags.consecutiveBullseyes = 0;
    }

    const label = wind?.label || '';
    if (score >= 5 && (label.includes('MODERATE') || label.includes('STRONG'))) {
      flags.highWindBullseye = true;
    }
  },

  recordRifleQualification(level, score, marine, scores) {
    const game = State.game;
    const profile = Achievements.ensureProfile();
    const flags = Achievements.ensureRunState(game);
    profile.stats.bestRifleScore = Math.max(profile.stats.bestRifleScore, score || 0);

    if (flags.firstQualResult === null) flags.firstQualResult = level;
    if (level === 'UNQ') flags.hadUNQ = true;

    if (level === 'Marksman') {
      Achievements.unlock('qualified_marksman');
    }
    if (level === 'Sharpshooter') {
      Achievements.unlock('qualified_sharpshooter');
    }
    if (level === 'Expert') {
      Achievements.unlock('expert_rifleman');
      if (flags.firstQualResult === 'Expert') Achievements.unlock('expert_or_bust');
      if (flags.hadUNQ) Achievements.unlock('unq_redemption_arc');
    }
    if (flags.maxConsecutiveBullseyes >= 3) Achievements.unlock('pits_dont_sleep');
    if ((score || 0) >= 72) Achievements.unlock('distinguished');
    if (flags.highWindBullseye) Achievements.unlock('wind_whisperer');

    // ── Shot-string achievements (require full 15-shot array) ──
    if (scores && scores.length === 15) {
      const prone    = scores.slice(0, 5);
      const kneeling = scores.slice(5, 10);
      const standing = scores.slice(10, 15);

      // Perfect Card: Prone + Kneeling — all 5s in both strings
      if (prone.every(s => s === 5) && kneeling.every(s => s === 5)) {
        Achievements.unlock('perfect_card_prone_kneeling');
      }

      // Standing On Business — no 0s, at least three 4+ shots
      if (standing.every(s => s > 0) && standing.filter(s => s >= 4).length >= 3) {
        Achievements.unlock('standing_on_business');
      }

      // The Comeback — any string starts ≤1 and ends with two 5s
      const strings = [prone, kneeling, standing];
      if (strings.some(str => str[0] <= 1 && str[3] === 5 && str[4] === 5)) {
        Achievements.unlock('the_comeback_shot');
      }

      // One Point Short — exactly 64 total
      if ((score || 0) === 64) Achievements.unlock('one_point_short');

      // Standing God Mode — all 5s in standing
      if (standing.every(s => s === 5)) Achievements.unlock('standing_god_mode');

      // The Perfect Card — all 15 shots are 5
      if (scores.every(s => s === 5)) Achievements.unlock('the_perfect_card');
    }

    Achievements.evaluateMarine(game, marine);
    Achievements._saveProfile();
  },

  recordCareerCompletion(game, endStateId, marine) {
    const profile = Achievements.ensureProfile();
    const flags = Achievements.ensureRunState(game);
    if (flags.careerCompleted) return;
    flags.careerCompleted = true;
    profile.stats.careersCompleted += 1;

    const durationMinutes = (Date.now() - flags.runStartedAt) / 60000;
    const goodEnding = ['smooth_civilian', 'family_first', 'high_achiever_eas', 'basic_eas', 'retirement', 'high_achiever_retirement'].includes(endStateId);
    const isRetire = endStateId === 'retirement' || endStateId === 'high_achiever_retirement';
    const isEAS = ['smooth_civilian', 'family_first', 'high_achiever_eas', 'basic_eas'].includes(endStateId);

    if (durationMinutes <= 3) Achievements.unlock('speed_bump_career');
    if (marine.timeInService <= 60 && durationMinutes <= 5) Achievements.unlock('four_year_any_percent');
    if (isRetire && durationMinutes <= 10) Achievements.unlock('retirement_any_percent');
    if (!flags.everMarried && marine.timeInService <= 60) Achievements.unlock('barracks_king');
    if (isEAS && marine.reputationWithLeadership >= 50) Achievements.unlock('honorable_eas');
    if (flags.debtStartedPositive && !flags.everDebtZero) Achievements.unlock('never_paid_it_off');
    if (isEAS && marine.debt <= 0 && marine.savings >= 10000) Achievements.unlock('debt_free_eas');
    if (marine.reserveStatus === 'SMCR') Achievements.unlock('smcr_encore');
    if (flags.njpCountSafe === undefined) flags.njpCountSafe = marine.njpCount || 0;
    if ((marine.njpCount || 0) === 0 && marine.rifleQualLevel !== 'UNQ' && !flags.hadMajorSetback && endStateId !== 'bad_discharge' && endStateId !== 'brig_discharge') {
      Achievements.unlock('clean_record');
    }
    if ((marine.awards || []).length >= 4) Achievements.unlock('stack_builder');
    if (endStateId === 'smooth_civilian') Achievements.unlock('smooth_transition');
    if (isRetire) {
      profile.stats.retirements += 1;
      Achievements.unlock('twenty_years_of_damage');
      if (marine.injury !== 'major') Achievements.unlock('retired_with_knees');
    }
    if (flags.hadMajorSetback && goodEnding) Achievements.unlock('the_comeback_tour');
    if (isRetire && marine.rifleQualLevel === 'Expert' && marine.physicalFitness >= 85 && marine.reputationWithLeadership >= 80 && marine.stress <= 35 && marine.debt <= 0 && (marine.njpCount || 0) === 0) {
      Achievements.unlock('perfect_run');
    }

    Achievements.evaluateMarine(game, marine);
    Achievements._saveProfile();
  },

  evaluateMarine(game, marine) {
    if (!marine) return;
    const profile = Achievements.ensureProfile();
    const flags = Achievements.ensureRunState(game);

    profile.stats.bestSavings = Math.max(profile.stats.bestSavings, marine.savings || 0);
    flags.peakFitness = Math.max(flags.peakFitness || 0, marine.physicalFitness || 0);

    if ((marine.debt || 0) <= 0) flags.everDebtZero = true;
    if (marine.isMarried) flags.everMarried = true;
    if (marine.injury === 'major' || (marine.debt || 0) >= 10000 || (marine.njpCount || 0) > 0 || marine.rifleQualLevel === 'UNQ') {
      flags.hadMajorSetback = true;
    }

    if (marine.physicalFitness >= 85) Achievements.unlock('high_first_class');
    if (marine.billetTier >= 2) Achievements.unlock('fire_team_lead');
    if (marine.timeInService >= 120) Achievements.unlock('careerist');
    if ((marine.educationCredits || 0) >= 30 || (marine.pmeCompleted || []).length >= 2) Achievements.unlock('professional_student');
    if (marine.physicalFitness >= 80 && marine.profConduct >= 75 && marine.mosProficiency >= 75 && marine.disciplineRisk <= 20 && marine.stress <= 35) {
      Achievements.unlock('combat_ready');
    }
    if (marine.profConduct >= 75 && marine.reputationWithLeadership >= 75 && (marine.njpCount || 0) === 0 && marine.disciplineRisk <= 20) {
      flags.quietProfessionalMonths += 3;
    } else {
      flags.quietProfessionalMonths = 0;
    }
    if (flags.quietProfessionalMonths >= 24) Achievements.unlock('quiet_professional');

    if (marine.billetTier >= 3) flags.sectionLeadMonths += 3;
    else flags.sectionLeadMonths = 0;
    if (flags.sectionLeadMonths >= 12) Achievements.unlock('section_lead');

    if (marine.stress >= 70) flags.highStressMonths += 3;
    else flags.highStressMonths = 0;
    if (flags.highStressMonths >= 6) Achievements.unlock('energy_drink_logistics');

    if (marine.isMarried && marine.debt > 0) flags.marriedDebtMonths += 3;
    else flags.marriedDebtMonths = 0;
    if (flags.marriedDebtMonths >= 6) Achievements.unlock('two_paychecks_still_broke');

    const lastPf = typeof flags.lastPhysicalFitness === 'number' ? flags.lastPhysicalFitness : marine.physicalFitness;
    if (marine.physicalFitness > lastPf) flags.ptImproveMonths = (flags.ptImproveMonths || 0) + 3;
    else flags.ptImproveMonths = 0;
    flags.lastPhysicalFitness = marine.physicalFitness;

    if (marine.degreeProgress === 'bachelor' || marine.degreeProgress === 'master' || (marine.educationCredits || 0) >= 120) {
      Achievements.unlock('smooth_transition');
    }
    if (marine.payGrade === 'E-7' && marine.billetTier >= 5 && marine.profConduct >= 80 && marine.reputationWithLeadership >= 80) {
      Achievements.unlock('the_standard');
    }
    if (marine.timeInService >= 120 && marine.reputationWithLeadership >= 75 && marine.physicalFitness >= 75 && marine.stress <= 35) {
      Achievements.unlock('legendary_consistency');
    }
    if (marine.profConduct >= 75 && marine.reputationWithLeadership >= 70 && marine.physicalFitness >= 75 && (marine.pmeCompleted || []).length >= 1 && marine.timeInService >= 48) {
      Achievements.unlock('the_professional');
    }
  },

  unlock(id) {
    const profile = Achievements.ensureProfile();
    const def = Achievements.getDefinition(id);
    if (!def || profile.unlocked[id]) return false;
    profile.unlocked[id] = { unlockedAt: new Date().toISOString() };
    Achievements._saveProfile();
    window.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: { achievement: def } }));
    return true;
  },

  getDefinition(id) {
    return ACHIEVEMENT_DEFS.find(def => def.id === id) || RANK_ACHIEVEMENTS.find(def => def.id === id) || null;
  },

  buildIconUrl(iconName, color = 'c8a96e') {
    if (!iconName) return '';
    const parts = iconName.split(':');
    if (parts.length !== 2) return '';
    return 'https://api.iconify.design/' + parts[0] + '/' + parts[1] + '.svg?color=%23' + color;
  },

  getAchievementGroups() {
    const profile = Achievements.ensureProfile();
    return TIER_ORDER.map(tier => ({
      id: tier,
      label: TIER_LABELS[tier],
      items: ACHIEVEMENT_DEFS.filter(def => def.tier === tier).map(def => ({
        ...def,
        unlockHint: UNLOCK_HINTS[def.id] || 'Keep playing to discover this one.',
        unlocked: !!profile.unlocked[def.id],
        unlockedAt: profile.unlocked[def.id]?.unlockedAt || null
      }))
    })).filter(group => group.items.length > 0);
  },

  getRankCards() {
    const profile = Achievements.ensureProfile();
    return RANK_ACHIEVEMENTS.map(rank => ({
      ...rank,
      tierLabel: TIER_LABELS[rank.tier] || '',
      unlockHint: rank.desc,
      unlocked: !!profile.unlocked[rank.id],
      timesReached: profile.rankCounts[rank.grade] || 0,
      unlockedAt: profile.unlocked[rank.id]?.unlockedAt || null
    }));
  },

  getSummary() {
    const profile = Achievements.ensureProfile();
    const total = ACHIEVEMENT_DEFS.length + RANK_ACHIEVEMENTS.length;
    const unlocked = Object.keys(profile.unlocked).length;
    return {
      total,
      unlocked,
      completionPct: total > 0 ? Math.round((unlocked / total) * 100) : 0,
      stats: profile.stats
    };
  },

  _loadProfile() {
    try {
      const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
      if (!raw) return Achievements._defaultProfile();
      const parsed = JSON.parse(raw);
      const merged = Achievements._defaultProfile();
      merged.unlocked = parsed.unlocked || {};
      merged.rankCounts = { ...merged.rankCounts, ...(parsed.rankCounts || {}) };
      merged.stats = { ...merged.stats, ...(parsed.stats || {}) };
      return merged;
    } catch (e) {
      console.warn('Achievements load failed:', e);
      return Achievements._defaultProfile();
    }
  },

  _saveProfile() {
    if (!Achievements.profile) return;
    try {
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(Achievements.profile));
    } catch (e) {
      console.warn('Achievements save failed:', e);
    }
  },

  _defaultProfile() {
    const rankCounts = {};
    RANK_ACHIEVEMENTS.forEach(rank => { rankCounts[rank.grade] = 0; });
    return {
      version: 2,
      unlocked: {},
      rankCounts,
      stats: {
        careersStarted: 0,
        careersCompleted: 0,
        reenlistments: 0,
        retirements: 0,
        deployments: 0,
        promotions: 0,
        highestRank: 'E-1',
        bestSavings: 0,
        bestRifleScore: 0
      }
    };
  },

  _higherRank(current, next) {
    const order = ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9'];
    return order.indexOf(next) > order.indexOf(current) ? next : current;
  }
};



