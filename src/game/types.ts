export type GameScreenState = 'title' | 'playing' | 'paused' | 'gameover';

export type TurnPhase =
  | 'ready_to_roll'
  | 'rolling_dice'
  | 'showing_dice_result'
  | 'running_student'
  | 'jail_decision'
  | 'ready_to_draw_question'
  | 'drawing_question_card'
  | 'answering_question'
  | 'ready_to_draw_property'
  | 'drawing_property_card'
  | 'viewing_property_card'
  | 'ready_to_draw_chance'
  | 'drawing_chance_card'
  | 'viewing_chance_card'
  | 'turn_complete';

export type CharacterAvatarId = 'etken' | 'edilgen' | 'donuslu';
export type OptionLetter = 'A' | 'B' | 'C' | 'D';

export type BoardTileType =
  | 'start'
  | 'location'
  | 'question'
  | 'reward'
  | 'jail';

export interface BoardTile {
  index: number; // 0..23
  type: BoardTileType;
  id: string;
  name: string;
  shortLabel: string;
  districtTag: string;
  accentColor: string;
  architectureNote?: string;
  historicalFact?: string;
  boardPos: [number, number]; // [x, z] on the 24-tile track
  landmarkPos?: [number, number]; // [x, z] for 3D landmark outside track
  landmarkRotY?: number;
  cameraFocusOffset: [number, number, number];
}

export interface QuestionOption {
  letter: OptionLetter;
  text: string;
}

export interface QuestionCard {
  number: number; // 1..15 exact
  id: string;
  topicTag: string;
  quoteBlock?: string;
  stem: string;
  options: [QuestionOption, QuestionOption, QuestionOption, QuestionOption];
  correctAnswer: OptionLetter; // Teacher key only; never displayed before submission
  explanation: string;
}

export type AssetKind = 'emlak';

export interface PropertyAsset {
  id: string;
  name: string;
  kind: AssetKind;
  price: number;
  districtTileIndex: number; // Board tile anchor for 3D ownership marker
  marketInfo: string;
  color: string;
}

export type ChanceEffectType =
  | 'extra_roll'
  | 'skip_turn'
  | 'gain_bp'
  | 'lose_bp'
  | 'property_discount'
  | 'bonus_property_draw';

export interface ChanceCard {
  id: string;
  title: string;
  kind: 'sans' | 'kriz' | 'ceza';
  description: string;
  effectType: ChanceEffectType;
  value?: number;
}

export interface PawnColorOption {
  id: string;
  name: string;
  hex: string;
  darkHex: string;
}

export interface CharacterOption {
  id: CharacterAvatarId;
  name: string;
  role: string;
  accentHex: string;
}

export interface BankLoan {
  principal: number; // 50 BP
  repaymentDue: number; // 60 BP
  takenTurn: number;
}

export interface PeerLoan {
  id: string;
  lenderTeamId: number;
  borrowerTeamId: number;
  principal: number;
  repaymentAmount: number; // max 120% of principal
  paid: boolean;
}

export interface Team {
  id: number;
  name: string;
  colorId: string;
  colorHex: string;
  characterId: CharacterAvatarId;
  position: number; // 0..23
  hasLeftStart: boolean; // Ensures initial start at tile 0 gives 0 BP; subsequent laps give +50 BP
  bp: number; // Starts at exactly 100 BP
  ownedAssetIds: string[];
  questionsAnswered: number; // 0..7 (3 x 7 = 21)
  correctAnswers: number;
  wrongAnswers: number;
  jailTurnsRemaining: number; // 0 or 1 (pay 50 BP bail OR wait 1 turn without solving a question)
  nextPropertyDiscount: number; // Fixed TL discount amount, e.g. 25 or 35 TL
  extraRollPending: boolean;
  activeBankLoan: BankLoan | null;
  hasUsedBankLoan: boolean; // Bankadan oyun boyunca yalnızca 1 kez kredi çekilebilir!
}

export interface AnsweredQuestionRecord {
  questionNumber: number; // 1..21
  teamId: number;
  teamName: string;
  selectedAnswer: OptionLetter | null;
  correctAnswer: OptionLetter;
  isCorrect: boolean;
  timedOut?: boolean;
  tileName: string;
}

export interface FinanceLogEntry {
  id: string;
  summary: string;
  turn: number;
}

export interface SpecialEventToast {
  id: number;
  kind: 'start_bonus' | 'reward' | 'jail' | 'bank' | 'purchase' | 'info';
  title: string;
  subtitle: string;
}

export interface GameState {
  screen: GameScreenState;
  teams: Team[];
  activeTeamIndex: number;
  turnNumber: number;
  turnPhase: TurnPhase;
  lastDiceValue: number | null;
  questionDeckQueue: number[]; // Remaining undrawn questions (1..21)
  answeredQuestions: AnsweredQuestionRecord[];
  activeQuestionNumber: number | null;
  activePropertyAssetId: string | null;
  activeChanceCardId: string | null;
  pendingPropertyDrawAfterBonus: boolean;
  inspectedTileIndex: number | null;
  peerLoans: PeerLoan[];
  financeLog: FinanceLogEntry[];
  specialToast: SpecialEventToast | null;
  remainingSeconds: number; // 900 -> 0 (15 min)
  timerPaused: boolean;
  bannerMessage: string;
  lastQuestionOutcome: {
    questionNumber: number;
    selectedAnswer: OptionLetter | null;
    correctAnswer: OptionLetter;
    correct: boolean;
    timedOut?: boolean;
    deltaBp: number;
    explanation: string;
  } | null;
}
