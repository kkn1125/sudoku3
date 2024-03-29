import { v4 } from "uuid";

const CellState = {
  Fixed: "fixed",
  Guessed: "guess",
  Hinted: "hinted",
} as const;
type CellState = (typeof CellState)[keyof typeof CellState];

const CellType = {
  Board: "board",
  Input: "input",
  Memo: "memo",
} as const;
type CellType = (typeof CellType)[keyof typeof CellType];

export default class Cell {
  id: string;
  x: number;
  y: number;
  memo: number[];
  originValue: number;
  guessValue: number;
  state: CellState = CellState.Guessed; // 셀 상태
  // Guessed: 사용자 입력하는 / Fixed: 고정 된 / Hinted: 힌트 된
  type: CellType = CellType.Board; // Board: 게임 셀 / Input 번호 버튼 셀
  isGuessPassed: boolean = true; // 사용자 입력 통과 여부
  isSuccess: boolean = false; // 열, 행, 영역 완료 여부

  /* cell input type */
  amount: number = 9;
  current: number = 9;
  count() {
    if (this.current > 0) {
      this.current -= 1;
    }
  }
  clear() {
    this.current = 9;
  }

  constructor(x: number, y: number, value: number) {
    this.id = "cell-" + v4();
    this.x = x;
    this.y = y;
    this.memo = [];
    this.originValue = value || 0;
    this.guessValue = 0;
    this.stateGuessed();
    this.typeBoard();
  }

  /* set type */
  typeBoard() {
    this.type = CellType.Board;
  }
  typeInput() {
    this.type = CellType.Input;
  }
  typeMemo() {
    this.type = CellType.Memo;
  }
  /* type check */
  isTypeBoard() {
    return CellType.Board;
  }
  isTypeMemo() {
    return CellType.Memo;
  }
  isTypeInput() {
    return CellType.Input;
  }

  /* set state */
  stateFixed() {
    this.state = CellState.Fixed;
    this.guessValue = this.originValue;
  }
  stateGuessed() {
    this.state = CellState.Guessed;
  }
  stateHinted() {
    this.state = CellState.Hinted;
  }
  /* state check */
  isStateFixed() {
    return this.state === CellState.Fixed;
  }
  isStateGuessed() {
    return this.state === CellState.Guessed;
  }
  isStateHinted() {
    return this.state === CellState.Hinted;
  }

  /* guess passed */
  guessValuePassed() {
    this.isGuessPassed = true;
  }
  guessValueNotPassed() {
    this.isGuessPassed = false;
  }

  /* guess value match with origin value */
  isMatchedWithOrigin() {
    return this.guessValue === this.originValue;
  }
  /* replace guess value */
  replaceGuessValue(value: number) {
    this.guessValue = value;
  }
  /* init guess value */
  removeGuessValue() {
    this.guessValue = 0;
  }

  addMemo(value: number) {
    if (this.memo.includes(value)) {
      this.removeMemo(value);
    } else {
      this.memo.push(value);
    }
  }

  private removeMemo(value: number) {
    this.memo.splice(this.memo.indexOf(value), 1);
  }
  removeAllMemo() {
    this.memo = [];
  }

  /* read value */
  readGuessValue() {
    const valueByState =
      this.state === CellState.Fixed ? this.originValue : this.guessValue || "";
    return "" + valueByState;
  }
  readButtonValue() {
    switch (this.type) {
      case CellType.Board: {
        return "" + this.guessValue;
      }
      case CellType.Memo: {
        return "✍️";
      }
      case CellType.Input: {
        return "" + (this.guessValue === 0 ? "❌" : this.guessValue);
      }
    }
  }
  readMemo() {
    return this.memo.toSorted((a, b) => a - b);
  }

  hasMemoBy(value: number) {
    return this.memo.includes(value);
  }

  success() {
    this.isSuccess = true;
  }
}
