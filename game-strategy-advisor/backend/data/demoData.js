// Demo Data for AI Game Strategy Advisor
// All data is clearly labeled as SIMULATED/SAMPLE data

const teams = [
  {
    id: "team_alpha",
    name: "FC Alpha United",
    shortName: "FCAU",
    league: "Premier Analytics League",
    manager: "Carlos Rivera",
    formation: "4-3-3",
    color: "#1e40af",
    secondaryColor: "#93c5fd",
    stats: {
      wins: 14, draws: 5, losses: 4,
      goalsScored: 48, goalsConceded: 22,
      possession: 58, passAccuracy: 86,
      shotsPerGame: 14.2, shotsOnTarget: 6.8,
      tacklesPerGame: 18.4, interceptionsPerGame: 11.2,
      form: ["W", "W", "D", "W", "L"]
    },
    players: [
      { id: "p1", name: "Marco Santos", position: "GK", number: 1, rating: 7.8, goals: 0, assists: 0, age: 29, nationality: "Brazil" },
      { id: "p2", name: "Luca Ferrari", position: "CB", number: 4, rating: 7.9, goals: 2, assists: 1, age: 27, nationality: "Italy" },
      { id: "p3", name: "James Ward", position: "CB", number: 5, rating: 7.6, goals: 1, assists: 2, age: 31, nationality: "England" },
      { id: "p4", name: "Kai Müller", position: "LB", number: 3, rating: 7.5, goals: 1, assists: 5, age: 24, nationality: "Germany" },
      { id: "p5", name: "Roberto Dias", position: "RB", number: 2, rating: 7.7, goals: 2, assists: 6, age: 26, nationality: "Portugal" },
      { id: "p6", name: "Yusuf Alkan", position: "CM", number: 6, rating: 8.1, goals: 4, assists: 8, age: 28, nationality: "Turkey" },
      { id: "p7", name: "Emre Demir", position: "CM", number: 8, rating: 8.3, goals: 6, assists: 10, age: 25, nationality: "Turkey" },
      { id: "p8", name: "Sofiane Amari", position: "CM", number: 10, rating: 8.0, goals: 5, assists: 7, age: 27, nationality: "Algeria" },
      { id: "p9", name: "Pedro Alves", position: "LW", number: 11, rating: 8.4, goals: 12, assists: 9, age: 23, nationality: "Brazil" },
      { id: "p10", name: "Hassan Omar", position: "ST", number: 9, rating: 8.6, goals: 18, assists: 4, age: 26, nationality: "Egypt" },
      { id: "p11", name: "Viktor Novak", position: "RW", number: 7, rating: 8.2, goals: 8, assists: 11, age: 24, nationality: "Czech Republic" }
    ]
  },
  {
    id: "team_beta",
    name: "Dynamo FC Beta",
    shortName: "DFCB",
    league: "Premier Analytics League",
    manager: "Stefan Koch",
    formation: "4-2-3-1",
    color: "#dc2626",
    secondaryColor: "#fca5a5",
    stats: {
      wins: 11, draws: 7, losses: 5,
      goalsScored: 38, goalsConceded: 28,
      possession: 51, passAccuracy: 82,
      shotsPerGame: 12.4, shotsOnTarget: 5.6,
      tacklesPerGame: 20.1, interceptionsPerGame: 13.4,
      form: ["D", "W", "W", "D", "W"]
    },
    players: [
      { id: "p21", name: "Anton Volkov", position: "GK", number: 1, rating: 7.9, goals: 0, assists: 0, age: 30, nationality: "Russia" },
      { id: "p22", name: "Ben Clarke", position: "CB", number: 4, rating: 7.5, goals: 1, assists: 0, age: 28, nationality: "England" },
      { id: "p23", name: "Diego Morales", position: "CB", number: 5, rating: 7.4, goals: 0, assists: 1, age: 32, nationality: "Spain" },
      { id: "p24", name: "Jamal Osei", position: "LB", number: 3, rating: 7.6, goals: 0, assists: 4, age: 25, nationality: "Ghana" },
      { id: "p25", name: "Nils Larsen", position: "RB", number: 2, rating: 7.5, goals: 1, assists: 3, age: 27, nationality: "Denmark" },
      { id: "p26", name: "Fabio Costa", position: "DM", number: 6, rating: 8.0, goals: 2, assists: 5, age: 29, nationality: "Brazil" },
      { id: "p27", name: "Artur Pena", position: "DM", number: 8, rating: 7.9, goals: 1, assists: 6, age: 26, nationality: "Spain" },
      { id: "p28", name: "Liam O'Brien", position: "AM", number: 10, rating: 8.2, goals: 7, assists: 9, age: 24, nationality: "Ireland" },
      { id: "p29", name: "Rashid Ali", position: "LM", number: 11, rating: 7.8, goals: 5, assists: 6, age: 23, nationality: "Morocco" },
      { id: "p30", name: "Tomas Vidal", position: "RM", number: 7, rating: 7.9, goals: 6, assists: 7, age: 25, nationality: "Chile" },
      { id: "p31", name: "Alexei Popov", position: "ST", number: 9, rating: 8.5, goals: 15, assists: 3, age: 27, nationality: "Russia" }
    ]
  },
  {
    id: "team_gamma",
    name: "City Lions SC",
    shortName: "CLSC",
    league: "Premier Analytics League",
    manager: "Antoine Dubois",
    formation: "3-5-2",
    color: "#16a34a",
    secondaryColor: "#86efac",
    stats: {
      wins: 9, draws: 8, losses: 6,
      goalsScored: 33, goalsConceded: 31,
      possession: 54, passAccuracy: 83,
      shotsPerGame: 11.8, shotsOnTarget: 5.1,
      tacklesPerGame: 19.2, interceptionsPerGame: 12.8,
      form: ["L", "W", "D", "W", "D"]
    },
    players: [
      { id: "p41", name: "Olivier Blanc", position: "GK", number: 1, rating: 7.7, goals: 0, assists: 0, age: 28, nationality: "France" },
      { id: "p42", name: "Marcus Brown", position: "CB", number: 5, rating: 7.6, goals: 2, assists: 1, age: 30, nationality: "England" },
      { id: "p43", name: "Ivan Petrov", position: "CB", number: 4, rating: 7.5, goals: 1, assists: 2, age: 29, nationality: "Bulgaria" },
      { id: "p44", name: "Kwame Asante", position: "CB", number: 6, rating: 7.4, goals: 0, assists: 1, age: 27, nationality: "Ghana" },
      { id: "p45", name: "Lu Wei", position: "RWB", number: 2, rating: 7.8, goals: 2, assists: 7, age: 25, nationality: "China" },
      { id: "p46", name: "Carlos Mendez", position: "LWB", number: 3, rating: 7.7, goals: 1, assists: 6, age: 26, nationality: "Mexico" },
      { id: "p47", name: "Hamid Rahimi", position: "CM", number: 7, rating: 7.9, goals: 3, assists: 4, age: 28, nationality: "Iran" },
      { id: "p48", name: "Sven Eriksson", position: "CM", number: 8, rating: 8.0, goals: 4, assists: 5, age: 27, nationality: "Sweden" },
      { id: "p49", name: "João Lima", position: "CM", number: 10, rating: 8.1, goals: 5, assists: 8, age: 24, nationality: "Portugal" },
      { id: "p50", name: "Adama Diallo", position: "ST", number: 9, rating: 8.3, goals: 13, assists: 4, age: 25, nationality: "Senegal" },
      { id: "p51", name: "Nikola Jović", position: "ST", number: 11, rating: 8.0, goals: 10, assists: 5, age: 26, nationality: "Serbia" }
    ]
  }
];

const matches = [
  // FC Alpha United matches
  {
    id: "m1", homeTeam: "team_alpha", awayTeam: "team_beta",
    homeScore: 3, awayScore: 1, date: "2024-11-10",
    competition: "League", round: 12,
    homeFormation: "4-3-3", awayFormation: "4-2-3-1",
    homePossession: 58, awayPossession: 42,
    homeShots: 15, awayShots: 9, homeShotsOnTarget: 7, awayShotsOnTarget: 4,
    homePasses: 542, awayPasses: 391, homePassAccuracy: 87, awayPassAccuracy: 80,
    homeTackles: 18, awayTackles: 22, homeInterceptions: 11, awayInterceptions: 14,
    homeCorners: 7, awayCorners: 3, homeFouls: 10, awayFouls: 15,
    goals: [
      { minute: 23, team: "team_alpha", scorer: "Hassan Omar", assist: "Pedro Alves", type: "open_play" },
      { minute: 41, team: "team_alpha", scorer: "Emre Demir", assist: "Viktor Novak", type: "set_piece" },
      { minute: 67, team: "team_beta", scorer: "Alexei Popov", assist: "Liam O'Brien", type: "counter" },
      { minute: 84, team: "team_alpha", scorer: "Hassan Omar", assist: null, type: "penalty" }
    ],
    keyMoments: ["Alpha dominated possession in first half", "Beta tried high press after 60min", "Alpha exploited space behind Beta's high line"],
    xG: { home: 2.8, away: 1.1 },
    heatmap: { homeAttack: "central_right", awayAttack: "left_flank" }
  },
  {
    id: "m2", homeTeam: "team_gamma", awayTeam: "team_alpha",
    homeScore: 1, awayScore: 2, date: "2024-11-03",
    competition: "League", round: 11,
    homeFormation: "3-5-2", awayFormation: "4-3-3",
    homePossession: 44, awayPossession: 56,
    homeShots: 10, awayShots: 14, homeShotsOnTarget: 4, awayShotsOnTarget: 6,
    homePasses: 408, awayPasses: 519, homePassAccuracy: 82, awayPassAccuracy: 86,
    homeTackles: 21, awayTackles: 16, homeInterceptions: 14, awayInterceptions: 10,
    homeCorners: 4, awayCorners: 8, homeFouls: 13, awayFouls: 9,
    goals: [
      { minute: 15, team: "team_alpha", scorer: "Pedro Alves", assist: "Kai Müller", type: "open_play" },
      { minute: 54, team: "team_gamma", scorer: "Adama Diallo", assist: "João Lima", type: "header" },
      { minute: 78, team: "team_alpha", scorer: "Hassan Omar", assist: "Emre Demir", type: "counter" }
    ],
    keyMoments: ["Alpha pressed effectively in first 20 mins", "Gamma equalized with aerial threat", "Alpha exploited wide channels in second half"],
    xG: { home: 1.4, away: 2.2 },
    heatmap: { homeAttack: "central", awayAttack: "wide_channels" }
  },
  {
    id: "m3", homeTeam: "team_alpha", awayTeam: "team_gamma",
    homeScore: 2, awayScore: 2, date: "2024-10-26",
    competition: "League", round: 10,
    homeFormation: "4-3-3", awayFormation: "3-5-2",
    homePossession: 57, awayPossession: 43,
    homeShots: 13, awayShots: 11, homeShotsOnTarget: 5, awayShotsOnTarget: 5,
    homePasses: 528, awayPasses: 400, homePassAccuracy: 85, awayPassAccuracy: 81,
    homeTackles: 17, awayTackles: 20, homeInterceptions: 10, awayInterceptions: 13,
    homeCorners: 6, awayCorners: 5, homeFouls: 11, awayFouls: 12,
    goals: [
      { minute: 32, team: "team_alpha", scorer: "Viktor Novak", assist: "Roberto Dias", type: "open_play" },
      { minute: 44, team: "team_gamma", scorer: "Nikola Jović", assist: "Hamid Rahimi", type: "set_piece" },
      { minute: 59, team: "team_alpha", scorer: "Emre Demir", assist: "Hassan Omar", type: "open_play" },
      { minute: 88, team: "team_gamma", scorer: "Adama Diallo", assist: null, type: "penalty" }
    ],
    keyMoments: ["Late Gamma equalizer from penalty", "Alpha dominated central areas", "Gamma threat from set pieces throughout"],
    xG: { home: 2.1, away: 1.8 },
    heatmap: { homeAttack: "right_channel", awayAttack: "set_pieces" }
  },
  {
    id: "m4", homeTeam: "team_beta", awayTeam: "team_alpha",
    homeScore: 1, awayScore: 1, date: "2024-10-19",
    competition: "League", round: 9,
    homeFormation: "4-2-3-1", awayFormation: "4-3-3",
    homePossession: 46, awayPossession: 54,
    homeShots: 11, awayShots: 13, homeShotsOnTarget: 5, awayShotsOnTarget: 6,
    homePasses: 420, awayPasses: 495, homePassAccuracy: 83, awayPassAccuracy: 85,
    homeTackles: 23, awayTackles: 17, homeInterceptions: 15, awayInterceptions: 11,
    homeCorners: 4, awayCorners: 7, homeFouls: 14, awayFouls: 10,
    goals: [
      { minute: 37, team: "team_beta", scorer: "Alexei Popov", assist: "Liam O'Brien", type: "open_play" },
      { minute: 72, team: "team_alpha", scorer: "Hassan Omar", assist: "Pedro Alves", type: "open_play" }
    ],
    keyMoments: ["Beta sat deep and hit on counter", "Alpha struggled to break compact Beta midfield", "Late Alpha equalizer from patient build-up"],
    xG: { home: 1.3, away: 1.9 },
    heatmap: { homeAttack: "counter_right", awayAttack: "central_possession" }
  },
  {
    id: "m5", homeTeam: "team_alpha", awayTeam: "team_gamma",
    homeScore: 4, awayScore: 0, date: "2024-10-12",
    competition: "Cup", round: 4,
    homeFormation: "4-3-3", awayFormation: "3-5-2",
    homePossession: 63, awayPossession: 37,
    homeShots: 18, awayShots: 7, homeShotsOnTarget: 9, awayShotsOnTarget: 2,
    homePasses: 589, awayPasses: 342, homePassAccuracy: 88, awayPassAccuracy: 79,
    homeTackles: 15, awayTackles: 22, homeInterceptions: 9, awayInterceptions: 15,
    homeCorners: 9, awayCorners: 2, homeFouls: 8, awayFouls: 16,
    goals: [
      { minute: 12, team: "team_alpha", scorer: "Pedro Alves", assist: "Emre Demir", type: "open_play" },
      { minute: 28, team: "team_alpha", scorer: "Hassan Omar", assist: "Yusuf Alkan", type: "open_play" },
      { minute: 56, team: "team_alpha", scorer: "Viktor Novak", assist: "Roberto Dias", type: "open_play" },
      { minute: 81, team: "team_alpha", scorer: "Sofiane Amari", assist: "Hassan Omar", type: "open_play" }
    ],
    keyMoments: ["Dominant Alpha performance", "Gamma overloaded with Alpha's width", "Alpha's high press suffocated Gamma buildup"],
    xG: { home: 3.9, away: 0.6 },
    heatmap: { homeAttack: "wide_press", awayAttack: "none" }
  },
  {
    id: "m6", homeTeam: "team_beta", awayTeam: "team_gamma",
    homeScore: 2, awayScore: 1, date: "2024-11-17",
    competition: "League", round: 13,
    homeFormation: "4-2-3-1", awayFormation: "3-5-2",
    homePossession: 50, awayPossession: 50,
    homeShots: 13, awayShots: 12, homeShotsOnTarget: 6, awayShotsOnTarget: 5,
    homePasses: 462, awayPasses: 459, homePassAccuracy: 83, awayPassAccuracy: 82,
    homeTackles: 21, awayTackles: 20, homeInterceptions: 13, awayInterceptions: 12,
    homeCorners: 6, awayCorners: 5, homeFouls: 12, awayFouls: 13,
    goals: [
      { minute: 29, team: "team_beta", scorer: "Liam O'Brien", assist: "Fabio Costa", type: "set_piece" },
      { minute: 51, team: "team_gamma", scorer: "Adama Diallo", assist: "João Lima", type: "open_play" },
      { minute: 74, team: "team_beta", scorer: "Alexei Popov", assist: "Tomas Vidal", type: "open_play" }
    ],
    keyMoments: ["Beta physicality dominated midfield", "Gamma equalized with quick transitions", "Beta striker Popov proved decisive"],
    xG: { home: 2.0, away: 1.5 },
    heatmap: { homeAttack: "central_power", awayAttack: "transitions" }
  },
  {
    id: "m7", homeTeam: "team_alpha", awayTeam: "team_beta",
    homeScore: 1, awayScore: 2, date: "2024-09-28",
    competition: "League", round: 7,
    homeFormation: "4-3-3", awayFormation: "4-2-3-1",
    homePossession: 60, awayPossession: 40,
    homeShots: 16, awayShots: 8, homeShotsOnTarget: 5, awayShotsOnTarget: 5,
    homePasses: 557, awayPasses: 371, homePassAccuracy: 86, awayPassAccuracy: 81,
    homeTackles: 16, awayTackles: 24, homeInterceptions: 10, awayInterceptions: 16,
    homeCorners: 8, awayCorners: 3, homeFouls: 9, awayFouls: 17,
    goals: [
      { minute: 18, team: "team_alpha", scorer: "Viktor Novak", assist: "Emre Demir", type: "open_play" },
      { minute: 55, team: "team_beta", scorer: "Alexei Popov", assist: "Liam O'Brien", type: "counter" },
      { minute: 87, team: "team_beta", scorer: "Rashid Ali", assist: null, type: "counter" }
    ],
    keyMoments: ["Alpha dominated possession but struggled to convert", "Beta lethal on counter-attacks", "Alpha left too much space in behind"],
    xG: { home: 1.8, away: 1.4 },
    heatmap: { homeAttack: "possession_slow", awayAttack: "fast_counter" }
  },
  {
    id: "m8", homeTeam: "team_gamma", awayTeam: "team_beta",
    homeScore: 0, awayScore: 0, date: "2024-09-21",
    competition: "League", round: 6,
    homeFormation: "3-5-2", awayFormation: "4-2-3-1",
    homePossession: 52, awayPossession: 48,
    homeShots: 10, awayShots: 11, homeShotsOnTarget: 3, awayShotsOnTarget: 4,
    homePasses: 480, awayPasses: 441, homePassAccuracy: 83, awayPassAccuracy: 82,
    homeTackles: 22, awayTackles: 21, homeInterceptions: 14, awayInterceptions: 13,
    homeCorners: 5, awayCorners: 6, homeFouls: 14, awayFouls: 13,
    goals: [],
    keyMoments: ["Tactical battle, both teams cancelled each other out", "Tight midfield duel", "Both goalkeepers had little to do"],
    xG: { home: 0.9, away: 1.1 },
    heatmap: { homeAttack: "controlled", awayAttack: "controlled" }
  },
  {
    id: "m9", homeTeam: "team_alpha", awayTeam: "team_alpha_ext1",
    homeScore: 3, awayScore: 0, date: "2024-09-14",
    competition: "League", round: 5,
    homeFormation: "4-3-3", awayFormation: "5-3-2",
    homePossession: 65, awayPossession: 35,
    homeShots: 17, awayShots: 6, homeShotsOnTarget: 8, awayShotsOnTarget: 2,
    homePasses: 601, awayPasses: 322, homePassAccuracy: 89, awayPassAccuracy: 76,
    homeTackles: 14, awayTackles: 25, homeInterceptions: 8, awayInterceptions: 16,
    homeCorners: 10, awayCorners: 1, homeFouls: 7, awayFouls: 19,
    goals: [
      { minute: 8, team: "team_alpha", scorer: "Hassan Omar", assist: "Pedro Alves", type: "open_play" },
      { minute: 44, team: "team_alpha", scorer: "Emre Demir", assist: "Viktor Novak", type: "set_piece" },
      { minute: 70, team: "team_alpha", scorer: "Pedro Alves", assist: "Kai Müller", type: "open_play" }
    ],
    keyMoments: ["Alpha relentlessly pressed high and broke compact 5-3-2", "Dominant width play from Alpha wings", "Opposition struggled to build from back"],
    xG: { home: 3.4, away: 0.4 },
    heatmap: { homeAttack: "high_press_width", awayAttack: "defensive" }
  },
  {
    id: "m10", homeTeam: "team_beta", awayTeam: "team_alpha",
    homeScore: 2, awayScore: 3, date: "2024-08-31",
    competition: "League", round: 3,
    homeFormation: "4-2-3-1", awayFormation: "4-3-3",
    homePossession: 43, awayPossession: 57,
    homeShots: 10, awayShots: 15, homeShotsOnTarget: 6, awayShotsOnTarget: 8,
    homePasses: 390, awayPasses: 519, homePassAccuracy: 80, awayPassAccuracy: 86,
    homeTackles: 24, awayTackles: 17, homeInterceptions: 16, awayInterceptions: 11,
    homeCorners: 4, awayCorners: 7, homeFouls: 15, awayFouls: 10,
    goals: [
      { minute: 20, team: "team_alpha", scorer: "Viktor Novak", assist: "Emre Demir", type: "open_play" },
      { minute: 34, team: "team_beta", scorer: "Liam O'Brien", assist: "Fabio Costa", type: "open_play" },
      { minute: 50, team: "team_alpha", scorer: "Hassan Omar", assist: "Yusuf Alkan", type: "open_play" },
      { minute: 65, team: "team_beta", scorer: "Alexei Popov", assist: "Tomas Vidal", type: "open_play" },
      { minute: 83, team: "team_alpha", scorer: "Pedro Alves", assist: null, type: "open_play" }
    ],
    keyMoments: ["End-to-end thriller", "Alpha's late winner proved quality of their attack", "Beta dangerous from wide areas"],
    xG: { home: 1.9, away: 2.7 },
    heatmap: { homeAttack: "wide_counters", awayAttack: "central_dominance" }
  }
];

const tacticalPatterns = {
  team_alpha: {
    preferredFormations: ["4-3-3", "4-2-3-1"],
    attackStyle: "possession_based",
    defendingStyle: "high_press",
    buildupPlay: "short_passing",
    pressingTriggers: ["goalkeeper_ball", "back_pass", "poor_touch"],
    weaknesses: ["vulnerable_behind_high_line", "exposed_on_counters", "right_flank_less_active"],
    strengths: ["central_midfield_dominance", "wide_attack_variety", "set_piece_threat", "clinical_striker"],
    patterns: {
      attacking: "Alpha builds through the midfield triangle, using the CM depth. Quick switches to wide forwards who cut inside. Striker drops deep to create space.",
      defending: "High defensive line with aggressive pressing from forwards. Compact 4-3 shape in midfield when defending deep. Right-back pushes high creating overlap.",
      transitions: "Quick vertical passes when winning possession. Central midfielder drives forward. Wingers stay wide to stretch defense."
    }
  },
  team_beta: {
    preferredFormations: ["4-2-3-1", "4-4-2"],
    attackStyle: "counter_attack",
    defendingStyle: "mid_block",
    buildupPlay: "direct_play",
    pressingTriggers: ["loose_ball", "opponent_goalkeeper", "midfield_error"],
    weaknesses: ["slow_build_from_back", "vulnerable_to_pressing", "right_back_pace_issue", "limited_width"],
    strengths: ["physical_midfield", "striker_quality", "set_piece_defending", "organized_shape"],
    patterns: {
      attacking: "Beta allows opponent to have ball then springs with quick vertical passes to striker Popov. Number 10 O'Brien links play. Wide midfielders support late.",
      defending: "Deep mid-block in 4-2-3-1. Double pivot shields back four. Forces play wide then squeezes. Limited pressing triggers in own half.",
      transitions: "Direct long balls to striker or wide runners on counter. Quickly bypasses midfield. Number 10 makes late runs to support."
    }
  },
  team_gamma: {
    preferredFormations: ["3-5-2", "5-3-2"],
    attackStyle: "structured_build",
    defendingStyle: "medium_block",
    buildupPlay: "three_at_the_back_buildup",
    pressingTriggers: ["back_three_error", "long_ball_clearance"],
    weaknesses: ["wide_spaces_behind_wing_backs", "aerial_vulnerability_in_3CB", "slow_in_transition", "right_wing_back_coverage"],
    strengths: ["aerial_duels", "set_pieces_defending", "two_striker_combination", "wing_back_overlaps"],
    patterns: {
      attacking: "Gamma uses wing-backs as primary width creators. Two strikers combination play to hold up and link. Midfield three advances from box-to-box.",
      defending: "Three CBs absorb crosses and long balls. Wing-backs track back to form 5. Central midfielder screens. Vulnerable to quick switches behind wing-backs.",
      transitions: "Relies on strikers holding the ball. Wing-backs advance quickly when winning. Can leave large gaps when both advance."
    }
  }
};

const formations = {
  "4-3-3": {
    name: "4-3-3",
    positions: [
      { x: 50, y: 92, label: "GK", role: "Goalkeeper" },
      { x: 15, y: 72, label: "LB", role: "Left Back" },
      { x: 35, y: 72, label: "CB", role: "Center Back" },
      { x: 65, y: 72, label: "CB", role: "Center Back" },
      { x: 85, y: 72, label: "RB", role: "Right Back" },
      { x: 25, y: 50, label: "CM", role: "Central Midfielder" },
      { x: 50, y: 48, label: "CM", role: "Central Midfielder" },
      { x: 75, y: 50, label: "CM", role: "Central Midfielder" },
      { x: 15, y: 25, label: "LW", role: "Left Winger" },
      { x: 50, y: 20, label: "ST", role: "Striker" },
      { x: 85, y: 25, label: "RW", role: "Right Winger" }
    ]
  },
  "4-2-3-1": {
    name: "4-2-3-1",
    positions: [
      { x: 50, y: 92, label: "GK", role: "Goalkeeper" },
      { x: 15, y: 72, label: "LB", role: "Left Back" },
      { x: 35, y: 72, label: "CB", role: "Center Back" },
      { x: 65, y: 72, label: "CB", role: "Center Back" },
      { x: 85, y: 72, label: "RB", role: "Right Back" },
      { x: 35, y: 56, label: "DM", role: "Defensive Midfielder" },
      { x: 65, y: 56, label: "DM", role: "Defensive Midfielder" },
      { x: 15, y: 38, label: "LM", role: "Left Midfielder" },
      { x: 50, y: 36, label: "AM", role: "Attacking Midfielder" },
      { x: 85, y: 38, label: "RM", role: "Right Midfielder" },
      { x: 50, y: 18, label: "ST", role: "Striker" }
    ]
  },
  "3-5-2": {
    name: "3-5-2",
    positions: [
      { x: 50, y: 92, label: "GK", role: "Goalkeeper" },
      { x: 25, y: 72, label: "CB", role: "Center Back" },
      { x: 50, y: 72, label: "CB", role: "Center Back" },
      { x: 75, y: 72, label: "CB", role: "Center Back" },
      { x: 10, y: 52, label: "LWB", role: "Left Wing Back" },
      { x: 30, y: 52, label: "CM", role: "Central Midfielder" },
      { x: 50, y: 50, label: "CM", role: "Central Midfielder" },
      { x: 70, y: 52, label: "CM", role: "Central Midfielder" },
      { x: 90, y: 52, label: "RWB", role: "Right Wing Back" },
      { x: 35, y: 22, label: "ST", role: "Striker" },
      { x: 65, y: 22, label: "ST", role: "Striker" }
    ]
  },
  "4-4-2": {
    name: "4-4-2",
    positions: [
      { x: 50, y: 92, label: "GK", role: "Goalkeeper" },
      { x: 15, y: 72, label: "LB", role: "Left Back" },
      { x: 35, y: 72, label: "CB", role: "Center Back" },
      { x: 65, y: 72, label: "CB", role: "Center Back" },
      { x: 85, y: 72, label: "RB", role: "Right Back" },
      { x: 15, y: 50, label: "LM", role: "Left Midfielder" },
      { x: 38, y: 50, label: "CM", role: "Central Midfielder" },
      { x: 62, y: 50, label: "CM", role: "Central Midfielder" },
      { x: 85, y: 50, label: "RM", role: "Right Midfielder" },
      { x: 35, y: 24, label: "ST", role: "Striker" },
      { x: 65, y: 24, label: "ST", role: "Striker" }
    ]
  },
  "5-3-2": {
    name: "5-3-2",
    positions: [
      { x: 50, y: 92, label: "GK", role: "Goalkeeper" },
      { x: 10, y: 70, label: "LWB", role: "Left Wing Back" },
      { x: 28, y: 74, label: "CB", role: "Center Back" },
      { x: 50, y: 76, label: "CB", role: "Center Back" },
      { x: 72, y: 74, label: "CB", role: "Center Back" },
      { x: 90, y: 70, label: "RWB", role: "Right Wing Back" },
      { x: 28, y: 50, label: "CM", role: "Central Midfielder" },
      { x: 50, y: 48, label: "CM", role: "Central Midfielder" },
      { x: 72, y: 50, label: "CM", role: "Central Midfielder" },
      { x: 35, y: 24, label: "ST", role: "Striker" },
      { x: 65, y: 24, label: "ST", role: "Striker" }
    ]
  }
};

module.exports = { teams, matches, tacticalPatterns, formations };
