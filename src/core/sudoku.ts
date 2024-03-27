import Cell from "../modules/cell";
import { GameState } from "../types/sudoku.type";
import InputManager from "./input.manager";
import Renderer from "./renderer";

export interface SudokuBoardSize {
  x: number;
  y: number;
}

export default class Sudoku {
  // 게임을 실행 한다.
  // 게임을 초기화 한다.
  // 맵을 생성한다.
  selected: Cell | null = null;

  state: GameState = GameState.Init;

  tryAmount: number = 0;
  tryLimit: number = 5;
  level: number = 0;

  boards: Cell[][] = [];
  sizes: SudokuBoardSize = {
    x: 9,
    y: 9,
  };
  hints: number = 5;

  inputManager: InputManager;

  renderer: Renderer;

  constructor() {
    this.inputManager = new InputManager(this);
    this.renderer = new Renderer(this);
  }

  /* sudoku tools about map generate */
  /* 사용자가 직접 작성할 셀을 랜덤 배열로 값만큼 반환 */
  createRandomFixedCells(randomAmount: number) {
    const cells = this.boards.flat(1);
    const indexed = new Map<string, { x: number; y: number }>();

    const limit = this.sizes.x * this.sizes.y;

    while (indexed.size < (randomAmount > limit ? limit : randomAmount || 0)) {
      const index = Math.floor(Math.random() * cells.length);
      const randomCell = cells[index];
      if (!indexed.has(randomCell.id)) {
        indexed.set(randomCell.id, { x: randomCell.x, y: randomCell.y });
      }
    }

    return cells.filter((cell) => [...indexed.keys()].includes(cell.id));
  }

  /* 랜덤 베이스 맵을 생성할 때 사용하며, 인자로 전달 */
  createRandomBaseArray() {
    const temp: number[] = [];
    let seed = 6;

    while (temp.length < 9) {
      const randomValue = ((Math.floor(Math.random() * 3) + seed) % 9) + 1;
      if (!temp.includes(randomValue)) {
        temp.push(randomValue);
      }
      if (temp.length === 3 || temp.length === 6) {
        seed += 3;
      }
    }
    return temp;
  }

  /* seedNumber를 시작으로 오름차순한 맵 생성 */
  createStraightOrderMap(seedNumber?: number) {
    const temp = [];
    const { x, y } = this.sizes;
    let startValue = seedNumber || 0;
    for (let row = 0; row < y; row++) {
      const rows = [];
      for (let col = 0; col < x; col++, startValue = (startValue + 1) % 9) {
        const cell = new Cell(
          col,
          row,
          ((startValue + Math.floor(row / 3) + row * 3) % 9) + 1
        );
        rows.push(cell);
      }
      temp.push(rows);
    }
    return temp;
  }

  /* 랜덤 베이스를 기준으로 맵 생성 */
  createRandomBaseOrderMap(randomBase: number[]) {
    // const randomBase = [8, 4, 6, 2, 1, 3, 5, 7, 0];
    const temp = [];
    const { x, y } = this.sizes;
    for (let row = 0; row < y; row++) {
      const rows = [];
      for (let col = 0; col < x; col++) {
        const cell = new Cell(
          col,
          row,
          ((randomBase[col] + Math.floor(row / 3) + row * 3) % 9) + 1
        );
        rows.push(cell);
      }
      temp.push(rows);
    }
    return temp;
  }

  createMap() {
    const cellAmount = this.sizes.x * this.sizes.y;
    const levelRatio = 1 - this.level / 5;
    const levelFixedAmount =
      Math.floor(cellAmount * levelRatio) + (this.level - 5) * 5;
    // this.boards = this.createStraightOrderMap(2);
    this.boards = this.createRandomBaseOrderMap(this.createRandomBaseArray());
    // this.boards = this.createRandomBaseOrderMap();
    const guessCellList = this.createRandomFixedCells(levelFixedAmount);
    for (const cell of guessCellList) {
      const { x, y } = cell;
      const guessCell = this.selectOne(x, y);
      guessCell.stateFixed();
    }
  }

  randomMap() {
    const { x, y } = this.sizes;
    for (let row = 0; row < y; row++) {
      const rows = [];
      for (let col = 0; col < x; col++) {
        const randomValue = Math.floor(Math.random() * 9) + 1;
        const cell = new Cell(col, row, randomValue);
        rows.push(cell);
      }
      this.boards.push(rows);
    }
  }

  /* sudoku tools about game state */
  init() {
    this.state = GameState.Init;
    this.boards = [];
    this.sizes = {
      x: 9,
      y: 9,
    };
    this.hints = 5;
  }

  /**
   *
   * @param {number} level - 0 ~ 5 까지 난이도 조정
   * @example
   * sudoku.setLevel(0); // 처음하는 사람
   * sudoku.setLevel(1); // 초급자
   * sudoku.setLevel(2); // 중급자
   * sudoku.setLevel(3); // 고급자
   * sudoku.setLevel(4); // 숙련자
   * sudoku.setLevel(5); // 전문가
   */
  setLevel(level: number) {
    this.level = level;
  }

  run() {
    this.state = GameState.Running;
    this.createMap();
    this.renderer.render();
  }

  pause() {
    this.state = GameState.Pause;
  }
  end() {
    this.state = GameState.End;
  }

  /* sudoku tools about cell */
  selectOne(x: number, y: number) {
    const cell = this.boards?.[y]?.[x];
    return cell;
  }
  selectRow(y: number) {
    return this.boards?.[y];
  }
  selectColumn(x: number) {
    const temp = [];
    for (const row of this.boards) {
      const cell = row?.[x];
      if (cell) {
        temp.push(cell);
      }
    }
    return temp;
  }
  selectBox(x: number, y: number) {
    const blockX = Math.floor(x / 3) * 3;
    const blockY = Math.floor(y / 3) * 3;
    // console.log("block x:", blockX);
    // console.log("block y:", blockY);
    const temp = [];
    for (let row = blockY; row < blockY + 3; row++) {
      for (let col = blockX; col < blockX + 3; col++) {
        const cell = this.boards?.[row]?.[col];
        if (cell) {
          temp.push(cell);
        }
      }
    }
    console.log(blockX + "," + blockY + " :", temp);
    return temp;
  }

  /* sudoku tools about matched */
  isCorrect(area: Cell[]) {
    const areaList = area.map((cell) => cell.guessValue).filter((_) => _ !== 0);
    let isDuplicated = false;
    console.log("areaList", areaList, area);
    for (const cell of area) {
      const isMatched =
        areaList.indexOf(cell.guessValue) ===
        areaList.lastIndexOf(cell.guessValue);
      if (!isMatched) {
        isDuplicated = true;
        break;
      }
    }

    return !isDuplicated;
  }
  isFill(area: Cell[]) {
    const fillArray = new Array(this.sizes.x).fill(false);
    area.forEach((cell) => {
      fillArray[cell.guessValue - 1] = true;
    });
    return fillArray.every((isMatched) => isMatched);
  }
  guessByCell(cell: Cell) {
    const row = this.selectRow(cell.y);
    const column = this.selectColumn(cell.x);
    const box = this.selectBox(cell.x, cell.y);

    // console.log(cell.x, cell.y);

    // console.log("row", row);
    // console.log("column", column);
    // console.log("box", box);

    const isCorrectRow = this.isCorrect(row);
    const isCorrectColumn = this.isCorrect(column);
    const isCorrectBox = this.isCorrect(box);

    const isRowFill = this.isFill(row);
    const isColumnFill = this.isFill(column);
    const isBoxFill = this.isFill(box);

    return {
      row,
      column,
      box,
      isCorrectRow,
      isCorrectColumn,
      isCorrectBox,
      isRowFill,
      isColumnFill,
      isBoxFill,
      isCorrect: isCorrectRow && isCorrectColumn && isCorrectBox,
      ifFill: isRowFill && isColumnFill && isBoxFill,
    };
  }

  /* try amount control */
  tryFailCount() {
    this.tryAmount += 1;
    if (this.tryAmount >= this.tryLimit) {
      console.warn("game over!");
      alert("모든 기회를 소진했습니다!");
      // TODO: 게임 리셋
      return;
    }
  }

  clearGuessPassed() {
    for (const cell of this.boards.flat(1)) {
      const { isCorrect } = this.guessByCell(cell);
      if (isCorrect) {
        cell.guessValuePassed();
      }
    }
  }
}
