export type StatCategory = 
  | 'passing' 
  | 'attacking' 
  | 'defending' 
  | 'physical' 
  | 'goalkeeper' 
  | 'team' 
  | 'advanced'
  | 'general';

export interface StatDefinition {
  id: string;
  name: string;
  shortName: string;
  category: StatCategory;
  description: string;
  calculation: string;
  interpretation: string;
  goodRange?: string;
  icon?: string;
}

export const statsDefinitions: Record<string, StatDefinition> = {
  // ============================================
  // GENERAL STATS
  // ============================================
  overall_rating: {
    id: 'overall_rating',
    name: 'Overall Rating',
    shortName: 'OVR',
    category: 'general',
    description: 'A composite score representing the player\'s overall ability and performance level.',
    calculation: 'Weighted average of all player attributes (Passing, Shooting, Dribbling, Defending, Physical) combined with recent match performance metrics.',
    interpretation: 'Higher ratings indicate more complete players. Use this to quickly assess player quality, but always consider position-specific attributes for tactical decisions.',
    goodRange: '80+ is excellent, 70-79 is good, 60-69 is average',
  },
  matches_played: {
    id: 'matches_played',
    name: 'Matches Played',
    shortName: 'M',
    category: 'general',
    description: 'Total number of matches the player has participated in.',
    calculation: 'Count of all matches where the player was on the pitch for any duration.',
    interpretation: 'Shows player availability and involvement. Compare with minutes played to understand if they\'re starting or coming off the bench.',
    goodRange: 'Context-dependent based on season length',
  },
  minutes_played: {
    id: 'minutes_played',
    name: 'Minutes Played',
    shortName: 'Min',
    category: 'general',
    description: 'Total time spent on the pitch across all matches.',
    calculation: 'Sum of all minutes played in each match, including stoppage time.',
    interpretation: 'Key indicator of player involvement and fitness. Higher minutes suggest the player is a regular starter and trusted by the coach.',
    goodRange: '90 mins per match for starters',
  },
  goals: {
    id: 'goals',
    name: 'Goals',
    shortName: 'G',
    category: 'attacking',
    description: 'Total number of goals scored by the player.',
    calculation: 'Count of all goals where the ball legally crosses the goal line after the player\'s touch.',
    interpretation: 'Primary measure of attacking output. Compare with xG to assess if the player is over or under-performing their chances.',
    goodRange: 'Varies by position - 15+ for strikers, 5+ for midfielders per season',
    icon: 'goal',
  },
  assists: {
    id: 'assists',
    name: 'Assists',
    shortName: 'A',
    category: 'passing',
    description: 'Passes that directly lead to a goal being scored.',
    calculation: 'Count of passes that are immediately followed by a goal, with no other player touching the ball in between.',
    interpretation: 'Shows creativity and final ball quality. High assists indicate excellent vision and technical ability in the final third.',
    goodRange: '10+ per season is excellent for creative players',
    icon: 'assist',
  },

  // ============================================
  // PASSING STATS
  // ============================================
  total_passes: {
    id: 'total_passes',
    name: 'Total Passes',
    shortName: 'Pass',
    category: 'passing',
    description: 'Total number of passes attempted by the player.',
    calculation: 'Count of all intentional passes to teammates, regardless of outcome.',
    interpretation: 'Indicates involvement in build-up play. High numbers suggest a player who is central to the team\'s possession game.',
    goodRange: '40-60 per match for midfielders',
  },
  pass_accuracy: {
    id: 'pass_accuracy',
    name: 'Pass Accuracy',
    shortName: 'Pass%',
    category: 'passing',
    description: 'Percentage of passes that successfully reach a teammate.',
    calculation: '(Successful Passes / Total Passes) × 100',
    interpretation: 'Measures passing reliability. Context matters - safe sideways passes inflate this stat, while ambitious forward passes may lower it.',
    goodRange: '85%+ is excellent, 80-84% is good',
  },
  key_passes: {
    id: 'key_passes',
    name: 'Key Passes',
    shortName: 'KP',
    category: 'passing',
    description: 'Passes that directly create a shooting opportunity for a teammate.',
    calculation: 'Count of passes that lead to a shot attempt (excluding assists which result in goals).',
    interpretation: 'Excellent indicator of creativity. High key passes show a player who consistently creates chances, even if teammates don\'t convert.',
    goodRange: '2+ per match is excellent',
    icon: 'key-pass',
  },
  crosses: {
    id: 'crosses',
    name: 'Crosses',
    shortName: 'Crs',
    category: 'passing',
    description: 'Passes played from wide areas into the penalty box.',
    calculation: 'Count of passes from wide positions (outside the box width) into the penalty area.',
    interpretation: 'Important for wingers and fullbacks. High crosses indicate width in attack and service to strikers.',
    goodRange: '3-5 per match for wide players',
    icon: 'cross',
  },
  progressive_passes: {
    id: 'progressive_passes',
    name: 'Progressive Passes',
    shortName: 'Prog',
    category: 'passing',
    description: 'Passes that move the ball significantly closer to the opponent\'s goal.',
    calculation: 'Passes that move the ball at least 10 meters toward the opponent\'s goal, or any pass into the penalty area.',
    interpretation: 'Shows ability to break lines and advance play. High numbers indicate a player who drives the team forward rather than playing safe.',
    goodRange: '8-12 per match for creative midfielders',
    icon: 'progressive-pass',
  },
  passes_final_third: {
    id: 'passes_final_third',
    name: 'Final Third Passes',
    shortName: 'F3rd',
    category: 'passing',
    description: 'Passes completed in the attacking third of the pitch.',
    calculation: 'Count of successful passes where the ball is received in the final third (closest to opponent\'s goal).',
    interpretation: 'Indicates involvement in attacking play. High numbers show a player who operates in dangerous areas.',
    goodRange: '15+ per match for attacking players',
  },
  passes_in_box: {
    id: 'passes_in_box',
    name: 'Passes into Box',
    shortName: 'Box',
    category: 'passing',
    description: 'Passes that enter the opponent\'s penalty area.',
    calculation: 'Count of passes where the receiving point is inside the 18-yard box.',
    interpretation: 'Critical for chance creation. High numbers indicate a player who can deliver the ball into the most dangerous areas.',
    goodRange: '3-5 per match for creative players',
  },
  long_passes: {
    id: 'long_passes',
    name: 'Long Passes',
    shortName: 'Long',
    category: 'passing',
    description: 'Passes that travel more than 25 meters.',
    calculation: 'Count of passes where the distance between start and end point exceeds 25 meters.',
    interpretation: 'Shows range and ability to switch play. Important for defenders and deep-lying playmakers.',
    goodRange: '5-10 per match for defenders/DMs',
  },
  short_passes: {
    id: 'short_passes',
    name: 'Short Passes',
    shortName: 'Short',
    category: 'passing',
    description: 'Passes that travel less than 15 meters.',
    calculation: 'Count of passes where the distance between start and end point is less than 15 meters.',
    interpretation: 'Indicates involvement in combination play and possession retention.',
    goodRange: '30-40 per match for possession-based teams',
  },
  through_balls: {
    id: 'through_balls',
    name: 'Through Balls',
    shortName: 'Thru',
    category: 'passing',
    description: 'Passes played between or behind defenders into space for a teammate to run onto.',
    calculation: 'Count of passes that split the defensive line and are received by a teammate in space.',
    interpretation: 'Elite creative skill. High through ball numbers indicate exceptional vision and timing.',
    goodRange: '1-2 per match is excellent',
    icon: 'through-ball',
  },

  // ============================================
  // ATTACKING STATS
  // ============================================
  shots: {
    id: 'shots',
    name: 'Shots',
    shortName: 'Sht',
    category: 'attacking',
    description: 'Total number of shot attempts toward goal.',
    calculation: 'Count of all attempts to score, including shots blocked, saved, off target, or resulting in goals.',
    interpretation: 'Shows attacking intent and ability to get into shooting positions. Compare with shots on target for accuracy.',
    goodRange: '3-5 per match for strikers',
    icon: 'shot',
  },
  shots_on_target: {
    id: 'shots_on_target',
    name: 'Shots on Target',
    shortName: 'OT',
    category: 'attacking',
    description: 'Shots that would have gone into the goal if not saved or blocked on the line.',
    calculation: 'Count of shots that either result in a goal or require a save from the goalkeeper.',
    interpretation: 'Better indicator of shooting quality than total shots. Shows ability to test the goalkeeper.',
    goodRange: '40-50% of total shots',
    icon: 'shot-on-target',
  },
  shot_conversion: {
    id: 'shot_conversion',
    name: 'Shot Conversion Rate',
    shortName: 'Conv%',
    category: 'attacking',
    description: 'Percentage of shots that result in goals.',
    calculation: '(Goals / Total Shots) × 100',
    interpretation: 'Measures finishing efficiency. High conversion indicates clinical finishing, but very high rates may suggest the player is too selective.',
    goodRange: '15-25% is excellent',
  },
  xg: {
    id: 'xg',
    name: 'Expected Goals (xG)',
    shortName: 'xG',
    category: 'attacking',
    description: 'Statistical measure of the quality of chances based on shot location and type.',
    calculation: 'Sum of the probability of each shot resulting in a goal, based on historical data from similar shots (distance, angle, body part, assist type).',
    interpretation: 'Compare xG to actual goals: Goals > xG means clinical finishing, Goals < xG suggests underperformance or bad luck.',
    goodRange: 'Compare to actual goals scored',
    icon: 'xg-zones',
  },
  dribbles: {
    id: 'dribbles',
    name: 'Dribbles Attempted',
    shortName: 'Drb',
    category: 'attacking',
    description: 'Attempts to beat an opponent while maintaining possession.',
    calculation: 'Count of all attempts to dribble past a defender, regardless of outcome.',
    interpretation: 'Shows willingness to take on defenders. High numbers indicate an attacking threat who can create 1v1 situations.',
    goodRange: '5-8 per match for wingers',
    icon: 'dribble',
  },
  dribbles_successful: {
    id: 'dribbles_successful',
    name: 'Successful Dribbles',
    shortName: 'SDr',
    category: 'attacking',
    description: 'Dribble attempts that successfully beat the defender.',
    calculation: 'Count of dribbles where the player maintains possession after taking on the defender.',
    interpretation: 'Measures dribbling effectiveness. Compare to attempts for success rate - 50%+ is good.',
    goodRange: '50%+ success rate',
  },
  progressive_runs: {
    id: 'progressive_runs',
    name: 'Progressive Runs',
    shortName: 'PRn',
    category: 'attacking',
    description: 'Carries that move the ball significantly toward the opponent\'s goal.',
    calculation: 'Ball carries that advance the ball at least 10 meters toward goal, or into the penalty area.',
    interpretation: 'Shows ability to drive forward with the ball. Important for players who can break lines through carrying.',
    goodRange: '3-5 per match',
    icon: 'progressive-run',
  },
  aerial_duels_won: {
    id: 'aerial_duels_won',
    name: 'Aerial Duels Won',
    shortName: 'Air',
    category: 'attacking',
    description: 'Headers and aerial challenges won against opponents.',
    calculation: 'Count of aerial duels where the player wins the ball or makes first contact.',
    interpretation: 'Important for target men and set pieces. Also crucial for defenders at the other end.',
    goodRange: '50%+ win rate, 3-5 per match',
    icon: 'aerial-duel',
  },
  ball_touches: {
    id: 'ball_touches',
    name: 'Ball Touches',
    shortName: 'Tch',
    category: 'attacking',
    description: 'Total number of times the player touches the ball.',
    calculation: 'Count of all ball contacts, including passes, shots, dribbles, and controls.',
    interpretation: 'General involvement indicator. High touches show a player who is central to the team\'s play.',
    goodRange: '50-80 per match for midfielders',
  },

  // ============================================
  // DEFENDING STATS
  // ============================================
  blocks: {
    id: 'blocks',
    name: 'Blocks',
    shortName: 'Blk',
    category: 'defending',
    description: 'Shots or passes blocked by getting in the way of the ball.',
    calculation: 'Count of times a player blocks a shot or pass with any part of their body.',
    interpretation: 'Shows defensive positioning and bravery. High blocks indicate a player who puts their body on the line.',
    goodRange: '1-3 per match for defenders',
    icon: 'block',
  },
  interceptions: {
    id: 'interceptions',
    name: 'Interceptions',
    shortName: 'Int',
    category: 'defending',
    description: 'Passes intercepted by reading the opponent\'s play.',
    calculation: 'Count of opponent passes that the player intercepts to gain possession.',
    interpretation: 'Excellent indicator of defensive reading and anticipation. High interceptions show intelligent positioning.',
    goodRange: '2-4 per match for defensive midfielders',
    icon: 'interception',
  },
  clearances: {
    id: 'clearances',
    name: 'Clearances',
    shortName: 'Clr',
    category: 'defending',
    description: 'Defensive actions that remove the ball from a dangerous area.',
    calculation: 'Count of times a player clears the ball away from their defensive third under pressure.',
    interpretation: 'Important for center-backs. High clearances may indicate a team under pressure or a direct defensive style.',
    goodRange: '3-6 per match for center-backs',
    icon: 'clearance',
  },
  recoveries: {
    id: 'recoveries',
    name: 'Ball Recoveries',
    shortName: 'Rec',
    category: 'defending',
    description: 'Regaining possession of the ball from the opponent.',
    calculation: 'Count of times a player wins the ball back from the opponent (excluding tackles and interceptions).',
    interpretation: 'Shows work rate and pressing effectiveness. High recoveries indicate active defensive contribution.',
    goodRange: '5-8 per match',
  },
  tackles: {
    id: 'tackles',
    name: 'Tackles',
    shortName: 'Tkl',
    category: 'defending',
    description: 'Attempts to dispossess an opponent of the ball.',
    calculation: 'Count of all tackle attempts, regardless of outcome.',
    interpretation: 'Shows defensive engagement. Compare with tackles won for effectiveness.',
    goodRange: '2-4 per match',
  },
  tackles_won: {
    id: 'tackles_won',
    name: 'Tackles Won',
    shortName: 'TklW',
    category: 'defending',
    description: 'Successful tackles that win possession.',
    calculation: 'Count of tackles where the player successfully dispossesses the opponent.',
    interpretation: 'Measures tackling effectiveness. 60%+ success rate is good.',
    goodRange: '60%+ success rate',
  },

  // ============================================
  // PHYSICAL STATS
  // ============================================
  distance_covered: {
    id: 'distance_covered',
    name: 'Distance Covered',
    shortName: 'Dist',
    category: 'physical',
    description: 'Total distance run during the match in kilometers.',
    calculation: 'GPS/tracking data measuring total ground covered by the player.',
    interpretation: 'Shows work rate and fitness. Compare by position - midfielders typically cover most ground.',
    goodRange: '10-12km per match',
  },
  sprints: {
    id: 'sprints',
    name: 'Sprints',
    shortName: 'Spr',
    category: 'physical',
    description: 'Number of high-intensity runs above 25 km/h.',
    calculation: 'Count of runs where the player exceeds 25 km/h for at least 1 second.',
    interpretation: 'Shows explosive ability and intensity. Important for attackers and pressing teams.',
    goodRange: '20-30 per match',
  },

  // ============================================
  // GOALKEEPER STATS
  // ============================================
  saves: {
    id: 'saves',
    name: 'Saves',
    shortName: 'Sav',
    category: 'goalkeeper',
    description: 'Shots stopped by the goalkeeper.',
    calculation: 'Count of shots on target that the goalkeeper prevents from entering the goal.',
    interpretation: 'Primary measure of goalkeeper performance. Compare with save percentage for efficiency.',
    goodRange: '70%+ save percentage',
  },
  saves_inside_box: {
    id: 'saves_inside_box',
    name: 'Saves Inside Box',
    shortName: 'SavB',
    category: 'goalkeeper',
    description: 'Saves made from shots taken inside the penalty area.',
    calculation: 'Count of saves where the shot originated from inside the 18-yard box.',
    interpretation: 'These are typically harder saves. High numbers indicate good reflexes and positioning.',
    goodRange: 'Context-dependent',
  },
  punches: {
    id: 'punches',
    name: 'Punches',
    shortName: 'Pun',
    category: 'goalkeeper',
    description: 'Crosses or shots punched away by the goalkeeper.',
    calculation: 'Count of times the goalkeeper punches the ball clear rather than catching it.',
    interpretation: 'Shows ability to deal with crosses under pressure. Sometimes necessary when catching is risky.',
    goodRange: '1-3 per match',
  },
  catches: {
    id: 'catches',
    name: 'Catches',
    shortName: 'Ctch',
    category: 'goalkeeper',
    description: 'Crosses or shots caught cleanly by the goalkeeper.',
    calculation: 'Count of times the goalkeeper catches and holds the ball.',
    interpretation: 'Shows confidence and handling ability. Catching is generally preferred over punching.',
    goodRange: '3-5 per match',
  },
  sweepings: {
    id: 'sweepings',
    name: 'Sweeper Actions',
    shortName: 'Swp',
    category: 'goalkeeper',
    description: 'Times the goalkeeper comes off their line to clear danger.',
    calculation: 'Count of times the goalkeeper leaves the box or rushes out to intercept through balls.',
    interpretation: 'Important for high-line teams. Shows ability to act as a "sweeper keeper".',
    goodRange: '1-2 per match',
  },
  goals_conceded: {
    id: 'goals_conceded',
    name: 'Goals Conceded',
    shortName: 'GC',
    category: 'goalkeeper',
    description: 'Number of goals let in by the goalkeeper.',
    calculation: 'Count of goals scored against the team while the goalkeeper was on the pitch.',
    interpretation: 'Not solely the goalkeeper\'s responsibility - defense plays a major role. Compare with xG against for context.',
    goodRange: 'Lower is better - context dependent',
  },

  // ============================================
  // TEAM STATS
  // ============================================
  total_players: {
    id: 'total_players',
    name: 'Total Players',
    shortName: 'Plrs',
    category: 'team',
    description: 'Number of players in the squad.',
    calculation: 'Count of all registered players in the team.',
    interpretation: 'Squad depth indicator. Larger squads can handle fixture congestion better.',
    goodRange: '25-30 for professional teams',
  },
  total_matches: {
    id: 'total_matches',
    name: 'Total Matches',
    shortName: 'Mtch',
    category: 'team',
    description: 'Number of matches played by the team.',
    calculation: 'Count of all competitive matches played.',
    interpretation: 'Context for other stats - more matches means more data but also more fatigue.',
    goodRange: 'Season-dependent',
  },
  wins: {
    id: 'wins',
    name: 'Wins',
    shortName: 'W',
    category: 'team',
    description: 'Matches won by the team.',
    calculation: 'Count of matches where the team scored more goals than the opponent.',
    interpretation: 'Primary success metric. Win rate shows overall team performance.',
    goodRange: '50%+ win rate is good',
  },
  draws: {
    id: 'draws',
    name: 'Draws',
    shortName: 'D',
    category: 'team',
    description: 'Matches ending in a tie.',
    calculation: 'Count of matches where both teams scored the same number of goals.',
    interpretation: 'Too many draws may indicate inability to close out games or defensive solidity.',
    goodRange: 'Lower is generally better',
  },
  losses: {
    id: 'losses',
    name: 'Losses',
    shortName: 'L',
    category: 'team',
    description: 'Matches lost by the team.',
    calculation: 'Count of matches where the team scored fewer goals than the opponent.',
    interpretation: 'Analyze patterns in losses - home vs away, against specific opponents.',
    goodRange: 'Lower is better',
  },
  goals_scored: {
    id: 'goals_scored',
    name: 'Goals Scored',
    shortName: 'GF',
    category: 'team',
    description: 'Total goals scored by the team.',
    calculation: 'Sum of all goals scored across all matches.',
    interpretation: 'Attacking output measure. Compare with xG to assess if finishing is clinical or lucky.',
    goodRange: '2+ per match average',
  },
  goals_conceded_team: {
    id: 'goals_conceded_team',
    name: 'Goals Conceded',
    shortName: 'GA',
    category: 'team',
    description: 'Total goals conceded by the team.',
    calculation: 'Sum of all goals conceded across all matches.',
    interpretation: 'Defensive solidity measure. Compare with xG against for context.',
    goodRange: '1 or less per match average',
  },
  goal_difference: {
    id: 'goal_difference',
    name: 'Goal Difference',
    shortName: 'GD',
    category: 'team',
    description: 'Difference between goals scored and goals conceded.',
    calculation: 'Goals Scored - Goals Conceded',
    interpretation: 'Overall performance indicator. Positive GD indicates a team scoring more than conceding.',
    goodRange: 'Positive is good, +20 or more is excellent',
  },
  chances_created: {
    id: 'chances_created',
    name: 'Chances Created',
    shortName: 'CC',
    category: 'team',
    description: 'Opportunities created in the opponent\'s penalty area.',
    calculation: 'Count of passes or actions that create a shooting opportunity inside the box.',
    interpretation: 'Shows attacking threat and creativity. High chances created indicates good final third play.',
    goodRange: '10+ per match',
  },
  chances_final_third: {
    id: 'chances_final_third',
    name: 'Chances in Final Third',
    shortName: 'CF3',
    category: 'team',
    description: 'Opportunities created in the attacking third of the pitch.',
    calculation: 'Count of chances created in the final third, including outside the box.',
    interpretation: 'Broader measure of attacking threat than just box chances.',
    goodRange: '15+ per match',
  },

  // ============================================
  // ADVANCED INDICES
  // ============================================
  pci: {
    id: 'pci',
    name: 'Possession Control Index',
    shortName: 'PCI',
    category: 'advanced',
    description: 'Composite measure of how well a team controls possession.',
    calculation: 'Weighted combination of possession percentage, pass accuracy, and passes in opponent\'s half.',
    interpretation: 'Higher PCI indicates better ball control and ability to dictate play. Important for possession-based teams.',
    goodRange: '60+ is excellent',
  },
  cci: {
    id: 'cci',
    name: 'Chance Creation Index',
    shortName: 'CCI',
    category: 'advanced',
    description: 'Composite measure of attacking threat and chance quality.',
    calculation: 'Weighted combination of xG, key passes, crosses into box, and shots from good positions.',
    interpretation: 'Higher CCI indicates more dangerous attacks. Compare with goals to assess finishing quality.',
    goodRange: '65+ is excellent',
  },
  se: {
    id: 'se',
    name: 'Shooting Efficiency',
    shortName: 'SE',
    category: 'advanced',
    description: 'How efficiently the team converts chances into goals.',
    calculation: 'Combination of shot conversion rate, shots on target percentage, and goals vs xG ratio.',
    interpretation: 'Higher SE indicates clinical finishing. Low SE despite high chances suggests finishing problems.',
    goodRange: '55+ is good',
  },
  ds: {
    id: 'ds',
    name: 'Defensive Solidity',
    shortName: 'DS',
    category: 'advanced',
    description: 'Composite measure of defensive strength.',
    calculation: 'Weighted combination of clean sheets, blocks, interceptions, and xG against.',
    interpretation: 'Higher DS indicates a well-organized defense. Important for teams that prioritize defensive stability.',
    goodRange: '60+ is excellent',
  },
  tp: {
    id: 'tp',
    name: 'Transition & Progression',
    shortName: 'T&P',
    category: 'advanced',
    description: 'How effectively the team moves the ball from defense to attack.',
    calculation: 'Combination of progressive passes, progressive carries, and counter-attack frequency.',
    interpretation: 'Higher T&P indicates good ability to transition quickly and break through lines.',
    goodRange: '55+ is good',
  },
  rpe: {
    id: 'rpe',
    name: 'Recovery & Pressing Efficiency',
    shortName: 'RPE',
    category: 'advanced',
    description: 'How effectively the team wins the ball back.',
    calculation: 'Combination of recoveries, pressing success rate, and PPDA (passes allowed per defensive action).',
    interpretation: 'Higher RPE indicates an effective pressing team that wins the ball back quickly.',
    goodRange: '60+ is excellent',
  },

  // ============================================
  // SET PIECES
  // ============================================
  corners: {
    id: 'corners',
    name: 'Corners',
    shortName: 'Cor',
    category: 'team',
    description: 'Corner kicks won by the team.',
    calculation: 'Count of corner kicks awarded to the team.',
    interpretation: 'Indicates attacking pressure. More corners suggest sustained attacks in the final third.',
    goodRange: '5-8 per match',
  },
  free_kicks: {
    id: 'free_kicks',
    name: 'Free Kicks',
    shortName: 'FK',
    category: 'team',
    description: 'Free kicks won by the team.',
    calculation: 'Count of free kicks awarded for fouls on the team.',
    interpretation: 'Can indicate attacking threat (fouls in dangerous areas) or physical play.',
    goodRange: 'Context-dependent',
  },
  penalties: {
    id: 'penalties',
    name: 'Penalties',
    shortName: 'Pen',
    category: 'team',
    description: 'Penalty kicks awarded to the team.',
    calculation: 'Count of penalties won for fouls inside the opponent\'s box.',
    interpretation: 'High penalties indicate threat in the box. Compare with penalty conversion rate.',
    goodRange: 'Any penalty is a good chance',
  },
  throw_ins: {
    id: 'throw_ins',
    name: 'Throw-ins',
    shortName: 'Thr',
    category: 'team',
    description: 'Throw-ins taken by the team.',
    calculation: 'Count of throw-ins awarded to the team.',
    interpretation: 'General possession indicator. Long throw specialists can make these dangerous.',
    goodRange: 'Context-dependent',
  },
  fouls: {
    id: 'fouls',
    name: 'Fouls Committed',
    shortName: 'Fls',
    category: 'team',
    description: 'Fouls committed by the team.',
    calculation: 'Count of fouls called against the team.',
    interpretation: 'High fouls may indicate aggressive pressing or poor discipline. Risk of cards.',
    goodRange: 'Lower is generally better',
  },

  // ============================================
  // PLAYER ATTRIBUTES
  // ============================================
  attr_passing: {
    id: 'attr_passing',
    name: 'Passing Attribute',
    shortName: 'PAS',
    category: 'general',
    description: 'Player\'s overall passing ability rating.',
    calculation: 'Composite of short passing, long passing, crossing, and vision attributes.',
    interpretation: 'Higher values indicate better passers. Essential for midfielders and playmakers.',
    goodRange: '80+ is excellent',
  },
  attr_shooting: {
    id: 'attr_shooting',
    name: 'Shooting Attribute',
    shortName: 'SHO',
    category: 'general',
    description: 'Player\'s overall shooting ability rating.',
    calculation: 'Composite of finishing, shot power, long shots, and positioning attributes.',
    interpretation: 'Higher values indicate better finishers. Essential for strikers and attacking midfielders.',
    goodRange: '80+ is excellent for attackers',
  },
  attr_dribbling: {
    id: 'attr_dribbling',
    name: 'Dribbling Attribute',
    shortName: 'DRI',
    category: 'general',
    description: 'Player\'s overall dribbling ability rating.',
    calculation: 'Composite of ball control, dribbling, agility, and balance attributes.',
    interpretation: 'Higher values indicate better ball carriers. Essential for wingers and creative players.',
    goodRange: '80+ is excellent',
  },
  attr_defending: {
    id: 'attr_defending',
    name: 'Defending Attribute',
    shortName: 'DEF',
    category: 'general',
    description: 'Player\'s overall defending ability rating.',
    calculation: 'Composite of marking, tackling, interceptions, and heading attributes.',
    interpretation: 'Higher values indicate better defenders. Essential for center-backs and defensive midfielders.',
    goodRange: '80+ is excellent for defenders',
  },
  attr_physical: {
    id: 'attr_physical',
    name: 'Physical Attribute',
    shortName: 'PHY',
    category: 'general',
    description: 'Player\'s overall physical ability rating.',
    calculation: 'Composite of stamina, strength, speed, and jumping attributes.',
    interpretation: 'Higher values indicate more athletic players. Important for all positions in modern football.',
    goodRange: '75+ is good',
  },
};

// Helper function to get stat definition by ID
export function getStatDefinition(statId: string): StatDefinition | undefined {
  return statsDefinitions[statId];
}

// Helper function to get all stats by category
export function getStatsByCategory(category: StatCategory): StatDefinition[] {
  return Object.values(statsDefinitions).filter(stat => stat.category === category);
}

// Helper function to search stats
export function searchStats(query: string): StatDefinition[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(statsDefinitions).filter(
    stat =>
      stat.name.toLowerCase().includes(lowerQuery) ||
      stat.shortName.toLowerCase().includes(lowerQuery) ||
      stat.description.toLowerCase().includes(lowerQuery)
  );
}

// Get all unique categories
export function getAllCategories(): StatCategory[] {
  return ['general', 'passing', 'attacking', 'defending', 'physical', 'goalkeeper', 'team', 'advanced'];
}

// Category display names
export const categoryDisplayNames: Record<StatCategory, string> = {
  general: 'General',
  passing: 'Passing',
  attacking: 'Attacking',
  defending: 'Defending',
  physical: 'Physical',
  goalkeeper: 'Goalkeeper',
  team: 'Team',
  advanced: 'Advanced Metrics',
};
