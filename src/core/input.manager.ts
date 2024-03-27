import Cell from "../modules/cell";
import CellInput from "../modules/cell.Input";
import { CellState } from "../types/sudoku.type";
import Sudoku from "./sudoku";

export default class InputManager {
  parent: Sudoku;
  inputs: CellInput[] = [];
  resetQueue: Cell[] = [];

  constructor(sudoku: Sudoku) {
    this.parent = sudoku;

    for (let i = 0; i <= this.parent.sizes.y; i++) {
      const cell = new CellInput(10, i, i);
      cell.stateFixed();
      cell.typeInput();
      this.inputs.push(cell);
    }

    window.addEventListener("keydown", this.handleKeydown.bind(this));
    window.addEventListener("mousemove", this.handlePointer.bind(this));
    window.addEventListener("click", this.handleClick.bind(this));
    // window.addEventListener("change", this.handleInput.bind(this));
  }

  clearCount() {
    const clear = (input: CellInput) => input.clear();
    this.inputs.forEach(clear);
  }

  countCurrentAmountEachCells() {
    /* 인풋 버튼 현재 갯수 0으로 초기화 */
    this.clearCount();

    /* 인풋 버튼 현재 갯수 카운팅 */
    const cells = this.parent.boards.flat(1);
    for (const cell of cells) {
      if (cell.guessValue !== 0) {
        this.inputs[cell.guessValue - 1].count();
      }
    }
  }

  getPos(e: MouseEvent) {
    const canvasX = this.parent.renderer.canvas.width / 2;
    const canvasY = this.parent.renderer.canvas.height / 2;
    const boardX = (this.parent.sizes.x * this.parent.renderer.size) / 2;
    const boardY = (this.parent.sizes.y * this.parent.renderer.size) / 2;
    const pox = Math.floor(
      (e.clientX - canvasX + boardX) / this.parent.renderer.size
    );
    const poy = Math.floor(
      (e.clientY - canvasY + boardY) / this.parent.renderer.size
    );
    return { x: pox, y: poy };
  }

  /* handlers */
  handleKeydown(e: KeyboardEvent) {
    const key = e.key.toLowerCase();
    if (this.parent.selected) {
      if (key === "backspace") {
        this.parent.selected.guessValue = 0;
      } else if (key.match(/^[1-9]$/)) {
        this.parent.selected.guessValue = +key;
      }
      this.validateGuessValue(this.parent.selected);

      // this.parent.clearGuessPassed();
    }
    this.parent.selected = null;
  }

  handlePointer(e: MouseEvent) {
    const pos = this.getPos(e);
    this.parent.renderer.pointer = pos;
  }

  // handleInput(e: Event) {
  //   const target = e.target;
  // }

  handleClick(e: MouseEvent) {
    const pos = this.getPos(e);
    const target = e.target as HTMLButtonElement;

    if (
      target.tagName !== "button" &&
      0 <= pos.x &&
      pos.x < this.parent.sizes.x &&
      0 <= pos.y &&
      pos.y < this.parent.sizes.y
    ) {
      const cell = this.parent.selectOne(pos.x, pos.y);
      this.parent.selected = cell ?? null;
    } else {
      const target = e.target as HTMLButtonElement;
      if (!target) return;
      const cell = this.inputs[+(target.dataset.value || 0)];
      if (
        this.parent.selected &&
        this.parent.selected.state === CellState.Guessed
      ) {
        this.parent.selected.guessValue = cell.originValue;
        this.validateGuessValue(this.parent.selected);
      }
      this.parent.selected = null;

      // this.parent.clearGuessPassed();
    }
  }

  clearWrongCell() {
    if (this.parent.renderer.wrongCell !== null) {
      this.parent.renderer.wrongCell = null;
      this.parent.boards.flat(1).forEach((cell) => {
        cell.isSuccess = false;
      });
    }
  }

  validateGuessValue(cell: Cell) {
    this.clearWrongCell();
    const { isCorrect, row, isRowFill, column, isColumnFill, box, isBoxFill } =
      this.parent.guessByCell(cell);
    console.log("isCorrect", isCorrect);
    console.log(this.parent.renderer.wrongCell);
    if (isCorrect) {
      cell.guessValuePassed();
      if (isRowFill) {
        row.forEach((c) => {
          c.success();
          this.resetQueue.push(c);
        });
      }
      if (isColumnFill) {
        column.forEach((c) => {
          c.success();
          this.resetQueue.push(c);
        });
      }
      if (isBoxFill) {
        box.forEach((c) => {
          c.success();
          this.resetQueue.push(c);
        });
      }
      // if (!(isRowFill && isColumnFill && isBoxFill)) {
      //   ([] as Cell[])
      //     .concat(...row)
      //     .concat(...column)
      //     .concat(...box)
      //     .forEach((c) => {
      //       c.isSuccess = false;
      //     });
      // }
    } else {
      cell.guessValueNotPassed();
      console.warn("[not correct]");
      this.parent.tryFailCount();
      this.parent.renderer.wrongCell = cell;
    }
  }
}
