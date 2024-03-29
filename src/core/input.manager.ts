import Cell from "../modules/cell";
import Sudoku from "./sudoku";

export default class InputManager {
  parent: Sudoku;
  memoCell: Cell;
  inputs: Cell[] = [];
  resetQueue: Cell[] = [];
  memoMode: boolean = false;

  activeValue: number = 0;

  constructor(sudoku: Sudoku) {
    this.activeValue = 1;
    this.parent = sudoku;
    this.memoCell = new Cell(10, -1, -1);
    this.memoCell.typeMemo();

    const removeCell = new Cell(10, 0, 0);
    removeCell.typeInput();

    this.inputs.push(removeCell);

    for (let i = 0; i < this.parent.sizes.y; i++) {
      const cell = new Cell(10, i, i + 1);
      cell.stateFixed();
      cell.typeInput();

      this.inputs.push(cell);
    }

    window.addEventListener("keydown", this.handleKeydown.bind(this));
    window.addEventListener("mousemove", this.handlePointer.bind(this));
    window.addEventListener("click", this.handleClick.bind(this));
  }

  clearCount() {
    const clear = (input: Cell) => input.clear();
    this.inputs.forEach(clear);
  }

  getPos(e: MouseEvent) {
    const canvasX = this.parent.renderer.canvas.width * 0.5;
    const canvasY = this.parent.renderer.canvas.height * this.parent.offsetTop;
    const boardX = this.parent.sizes.x * this.parent.renderer.size * 0.5;
    const boardY =
      this.parent.sizes.y * this.parent.renderer.size * this.parent.offsetTop;
    const pox = Math.floor(
      (e.clientX - canvasX + boardX) / this.parent.renderer.size
    );
    const poy = Math.floor(
      (e.clientY - canvasY + boardY - this.parent.offsetTopPx) /
        this.parent.renderer.size
    );
    return { x: pox, y: poy };
  }

  toggleMemoMode() {
    this.memoMode = !this.memoMode;
  }

  calculateAndRerenderInputs() {
    this.parent.calculateEachValueAmount();
    this.parent.renderer.renderInputs();
  }

  /* handlers */
  handleKeydown(e: KeyboardEvent) {
    if (this.activeValue === 0 || !this.parent.isStateRun()) return;
    const key = e.key.toLowerCase();

    if (this.parent.isGameClear() || this.parent.isGameFail()) {
      return;
    }

    if (this.parent.selected && this.parent.selected.isStateGuessed()) {
      if (key === "backspace") {
        if (this.memoMode) {
          this.parent.selected.removeGuessValue();
          this.parent.selected.removeAllMemo();
          this.validateGuessValue(this.parent.selected);
          this.parent.selected = null;
        } else {
          this.parent.selected.removeGuessValue();
          this.parent.selected.removeAllMemo();
          this.validateGuessValue(this.parent.selected);
          this.parent.selected = null;
        }
        this.calculateAndRerenderInputs();
      } else if (key.match(/^[1-9]$/)) {
        if (this.memoMode) {
          // memo mode!
          const cell = this.inputs.find((input) => input.guessValue === +key);
          if (cell?.current !== 0) {
            this.parent.selected.addMemo(+key);
            this.parent.selected.removeGuessValue();
            this.calculateAndRerenderInputs();
            // console.log("key down cell", cell);
          }
        } else {
          // not memo mode!
          const cell = this.inputs.find((input) => input.guessValue === +key);
          if (cell?.current !== 0) {
            this.parent.selected.replaceGuessValue(+key);
            this.parent.selected.removeAllMemo();
            this.calculateAndRerenderInputs();
            this.validateGuessValue(this.parent.selected);
            this.parent.selected = null;
            // console.log("key down cell", cell);
          }
        }
      } else if (key.match(/^0$/)) {
        if (this.memoMode) {
          // memo mode!
          this.parent.selected.removeGuessValue();
          this.parent.selected.removeAllMemo();
          this.calculateAndRerenderInputs();
          // const cell = this.inputs.find((input) => input.guessValue === +key);
          // console.log("key down cell", cell);
          this.validateGuessValue(this.parent.selected);
          this.parent.selected = null;
        } else {
          // not memo mode!
          this.parent.selected.removeGuessValue();
          this.parent.selected.removeAllMemo();
          this.calculateAndRerenderInputs();
          // const cell = this.inputs.find((input) => input.guessValue === +key);
          // console.log("key down cell", cell);
          this.validateGuessValue(this.parent.selected);
          this.parent.selected = null;
        }
      }
    }
  }

  handlePointer(e: MouseEvent) {
    if (this.activeValue === 0 || !this.parent.isStateRun()) return;
    const pos = this.getPos(e);
    this.parent.renderer.pointer = pos;
  }

  handleClick(e: MouseEvent) {
    const pos = this.getPos(e);
    const target = e.target as HTMLButtonElement;

    if (this.parent.isGameClear() || this.parent.isGameFail()) {
      return;
    }

    if (target.id === "game-level") {
      this.parent.levelChangeAndRestartGame();
      return;
    }
    if (target.id === "game-state") {
      this.parent.resumeOrpause();
      return;
    }

    if (this.activeValue === 0 || !this.parent.isStateRun()) return;

    if (
      target.tagName !== "button" &&
      0 <= pos.x &&
      pos.x < this.parent.sizes.x &&
      0 <= pos.y &&
      pos.y < this.parent.sizes.y
    ) {
      // 스도쿠 보드 내 클릭 시
      const cell = this.parent.selectOne(pos.x, pos.y);
      this.parent.selected = cell ?? null;
    } else {
      // console.log("here");
      // 스도쿠 보드 밖 입력 패널 클릭 시
      const target = e.target as HTMLButtonElement;
      // 없으면 종료
      if (!target) {
        return;
      }

      /* memo mode */
      if (target.dataset.value === "-1") {
        this.toggleMemoMode();
        this.parent.renderer.renderInputs();
      } else {
        // 입력 패널 셀 찾기
        if (this.parent.selected && this.parent.selected.isStateGuessed()) {
          const index = Number(target.dataset.value);
          if (!Number.isNaN(index) && index > 0) {
            if (this.memoMode) {
              // memo mode!
              const cell = this.inputs[index];
              if (cell.originValue === 0) {
                this.parent.selected.removeAllMemo();
              } else {
                this.parent.selected.addMemo(cell.originValue);
              }
              this.parent.selected.removeGuessValue();
              this.calculateAndRerenderInputs();
            } else {
              // not memo mode!
              const cell = this.inputs[index];
              if (cell.originValue === 0) {
                this.parent.selected.removeGuessValue();
              } else {
                this.parent.selected.replaceGuessValue(cell.originValue);
                this.calculateAndRerenderInputs();
              }
              this.parent.selected.removeAllMemo();
            }
            this.validateGuessValue(this.parent.selected);
          } else {
            this.parent.selected.removeGuessValue();
            this.parent.selected.removeAllMemo();
            this.calculateAndRerenderInputs();
            this.validateGuessValue(this.parent.selected);
          }
        }
      }
      if (!this.memoMode || !("value" in target.dataset)) {
        this.parent.selected = null;
      }
    }
  }

  clearWrongCell() {
    if (this.parent.wrongCell !== null) {
      this.parent.wrongCell = null;
      this.parent.boards.flat(1).forEach((cell) => {
        cell.isSuccess = false;
      });
    }
  }

  validateGuessValue(cell: Cell) {
    this.clearWrongCell();
    const { isCorrect, row, isRowFill, column, isColumnFill, box, isBoxFill } =
      this.parent.guessByCell(cell);
    if (isCorrect) {
      if (this.parent.currentHistory) {
        if (this.parent.currentHistory.firstCorrectTime === 0) {
          this.parent.currentHistory.firstCorrectTime = this.parent.timer;
        }
      }

      /* 열, 행, 영역 맞으면 */
      // 해당 셀 guess pass 처리
      cell.guessValuePassed();
      for (const queue of this.resetQueue) {
        queue.isSuccess = false;
      }
      while (this.parent.renderer.timeoutQueue.length > 0) {
        const item = this.parent.renderer.timeoutQueue.shift();
        if (item) {
          const [timeout, cb] = item;
          clearTimeout(timeout);
          cb();
        }
      }

      if (isRowFill) {
        // 행이 통과되면 해당 영역 셀 완료 표시
        row.forEach((c) => {
          c.success();
          this.resetQueue.push(c);
        });
      }
      if (isColumnFill) {
        // 열이 통과되면 해당 영역 셀 완료 표시
        column.forEach((c) => {
          c.success();
          this.resetQueue.push(c);
        });
      }
      if (isBoxFill) {
        // 영역이 통과되면 해당 영역 셀 완료 표시
        box.forEach((c) => {
          c.success();
          this.resetQueue.push(c);
        });
      }
    } else {
      /* 다른 영역과 충돌된다면 */
      // 입력 셀 not guess pass 처리
      if (!this.memoMode) {
        if (this.parent.currentHistory) {
          if (this.parent.currentHistory.firstFailureTime === 0) {
            this.parent.currentHistory.firstFailureTime = this.parent.timer;
          }
        }
        console.warn("[not correct]");
        cell.guessValueNotPassed();
        // 엔진에 실패 횟수 카운트
        this.parent.tryFailCount();
        // 틀린 셀 저장
        this.parent.wrongCell = cell;
      }
    }

    this.parent.checkGameClear();
  }
}
