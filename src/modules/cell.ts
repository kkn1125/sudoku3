import { v4 } from "uuid";
import { CellState, CellType } from "../types/sudoku.type";

export default class Cell {
  id: string;
  x: number;
  y: number;
  memo: Set<number>;
  originValue: number;
  guessValue: number;
  state: CellState = CellState.Guessed;
  type: CellType = CellType.Board;
  isGuessPassed: boolean = true;
  isSuccess: boolean = false;

  constructor(x: number, y: number, value: number) {
    this.id = "cell-" + v4();
    this.x = x;
    this.y = y;
    this.memo = new Set();
    this.originValue = value || 0;
    this.guessValue = 0;
    this.stateGuessed();
    this.typeBoard();
  }

  typeBoard() {
    this.type = CellType.Board;
  }

  typeInput() {
    this.type = CellType.Input;
  }

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

  guessValuePassed() {
    this.isGuessPassed = true;
  }

  guessValueNotPassed() {
    this.isGuessPassed = false;
  }

  isMatchedWithOrigin() {
    return this.guessValue === this.originValue;
  }

  replaceGuessValue(value: number) {
    this.guessValue = value;
  }

  removeGuessValue() {
    this.guessValue = 0;
  }

  addMemo(value: number) {
    this.memo.add(value);
  }

  removeMemo(value: number) {
    this.memo.delete(value);
  }

  readMemo() {
    return [...this.memo].toSorted((a, b) => a - b);
  }

  success() {
    this.isSuccess = true;
  }
}
