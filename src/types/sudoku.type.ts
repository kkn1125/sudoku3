const CellState = {
  Fixed: "fixed",
  Guessed: "guess",
  Hinted: "hinted",
} as const;
type CellState = (typeof CellState)[keyof typeof CellState];

const CellType = {
  Board: "board",
  Input: "input",
} as const;
type CellType = (typeof CellType)[keyof typeof CellType];

const GameState = {
  Running: "running",
  Pause: "pause",
  Init: "init",
  End: "end",
} as const;
type GameState = (typeof GameState)[keyof typeof GameState];

const Palette = {
  White: "#ffffff",
  Default: "#565656",
  DefaultText: "#565656",
  DefaultBorder: "#56565656",
  BoxBorder: "#acacac",
  Selected: "#a625c576",
  Success: "#248d2e16",
  SameGuessValue: "#a625c536",
  Pointer: "#a625c556",
  Correct: "#248d2e",
  Danger: "#bb3636",
  DangerPointHighlight: "#bb363676",
  DangerHighlight: "#bb363636",
  LineHighlight: "#a625c516",
} as const;
type Palette = (typeof Palette)[keyof typeof Palette];

export { CellState, CellType, GameState, Palette };
