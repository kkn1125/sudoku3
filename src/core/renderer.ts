import Cell from '../modules/cell';
import { format, grade } from '../utils/global';
import History from './history';
import Sudoku from './sudoku';

const Palette = {
  White: '#ffffff',
  Default: '#565656',
  DefaultText: '#565656',
  DefaultBorder: '#56565656',
  BoxBorder: '#acacac',
  Selected: '#a625c576',
  Success: '#248d2e16',
  SameGuessValue: '#a625c536',
  Pointer: '#a625c556',
  Correct: '#248d2e',
  Danger: '#bb3636',
  DangerPointHighlight: '#bb363676',
  DangerHighlight: '#bb363636',
  LineHighlight: '#a625c516',
} as const;
type Palette = (typeof Palette)[keyof typeof Palette];

export default class Renderer {
  renderEndHistory(history: History) {
    const solvedGrade =
      '- Solved Level:' + '\n' + grade[this.parent.level as 0 | 1 | 2 | 3];
    const playTime = '- Play Time:' + '\n' + format(history.playTime);
    const firstCorrectTime =
      '- First Correct Time:' + '\n' + format(history.firstCorrectTime);
    const firstFailureTime =
      '- First Failure Time:' + '\n' + format(history.firstFailureTime);
    const pauseAmount = '- Pause Amount:' + '\n' + history.pauseAmount;
    const useHint = '- Used Hints:' + '\n' + (5 - this.parent.hints);
    alert(
      `# Sudoku Result!\n\n\n${solvedGrade}\n\n${playTime}\n\n${firstCorrectTime}\n\n${firstFailureTime}\n\n${pauseAmount}\n\n${useHint}`,
    );
  }

  playButtonToggle(state: string) {
    // console.log(state);
    const stateEl = document.querySelector('#game-state') as HTMLButtonElement;
    const pageEl = document.querySelector('#page') as HTMLDivElement;
    if (state === 'running') {
      stateEl.dataset.value = 'running';
      pageEl.dataset.hidden = 'true';
    } else if (state === 'hold') {
      stateEl.dataset.value = 'hold';
      pageEl.dataset.hidden = 'false';
    }
  }

  updateHint() {
    const hinting = document.querySelector(
      '#game-hinting',
    ) as HTMLButtonElement;
    if (hinting) {
      hinting.dataset.amount = '' + this.parent.hints;
      if (this.parent.hints === 0) {
        hinting.disabled = true;
      }
    }
  }

  parent: Sudoku;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  size: number = 50;
  pointer: { x: number; y: number } = { x: -1, y: -1 };
  selected: { x: number; y: number } = { x: -1, y: -1 };
  beforeTime: number = 0;

  inputPlace: 'right' | 'bottom' = 'right';

  timeoutQueue: [number, Function][] = [];

  activeValue: number = 0;

  constructor(sudoku: Sudoku) {
    const CANVAS = document.querySelector('#app') as HTMLCanvasElement;
    const ctx = CANVAS.getContext('2d') as CanvasRenderingContext2D;
    this.parent = sudoku;
    this.canvas = CANVAS;
    this.ctx = ctx;

    this.execListener();
  }

  destroy() {
    this.pointer = { x: -1, y: -1 };
    this.selected = { x: -1, y: -1 };
    cancelAnimationFrame(this.activeValue);
  }

  getGlobalSize() {
    const centerX = this.canvas.width * 0.5;
    const centerY = this.canvas.height * this.parent.offsetTop;
    const boardX = this.parent.boards[0].length * this.size * 0.5;
    const boardY =
      this.parent.boards.length * this.size * this.parent.offsetTop;
    return {
      centerX,
      centerY,
      boardX,
      boardY,
    };
  }

  execListener() {
    this.handleResizeCanvas();
    window.addEventListener('resize', this.handleResizeCanvas.bind(this));
  }

  maxOr(mediaSize: number) {
    return innerWidth < mediaSize;
  }

  minOr(mediaSize: number) {
    return mediaSize <= innerWidth;
  }

  minAndMax(minMediaSize: number, maxMediaSize: number) {
    return minMediaSize <= innerWidth && innerWidth < maxMediaSize;
  }

  handleResizeCanvas(_e?: UIEvent) {
    this.canvas.width = innerWidth;
    this.canvas.height = innerHeight;

    const ratio = innerHeight / innerWidth;
    // this.parent.offsetTopPx = 100 * ratio;
    if (this.minOr(1268)) {
      this.size = 50 * 1.2;
      this.inputPlace = 'right';
    } else if (this.minAndMax(1024, 1268)) {
      this.size = (50 / ratio) * 0.7;
      this.inputPlace = 'right';
    } else if (this.minAndMax(768, 1024)) {
      this.size = 46;
      this.inputPlace = 'right';
    } else if (this.minAndMax(568, 768)) {
      this.size = 42;
      this.inputPlace = 'right';
    } else if (this.minAndMax(368, 568)) {
      this.size = 34;
      this.inputPlace = 'right';
    } else if (this.maxOr(368)) {
      this.size = 30;
      this.inputPlace = 'right';
    } else {
      this.size = 56;
      this.inputPlace = 'right';
    }
  }

  drawCell(cell: Cell) {
    const { centerX, centerY, boardX, boardY } = this.getGlobalSize();
    const { x, y } = cell;
    const pox = x * this.size + centerX - boardX;
    const poy = y * this.size + centerY - boardY + this.parent.offsetTopPx;

    const value = cell.readGuessValue();
    const memos = cell.readMemo();

    this.ctx.fillStyle = Palette.White;

    if (cell.isSuccess) {
      this.ctx.fillStyle = Palette.Success;
    }

    /* 선택 셀 강조 */
    if (
      this.parent.selected?.x === cell.x &&
      this.parent.selected?.y === cell.y
    ) {
      this.ctx.fillStyle = Palette.Selected;
    }

    /* 선택 셀과 동일한 값 강조 (메모도 포함) */
    const isSame =
      this.parent.selected &&
      this.parent.selected.guessValue === cell.guessValue &&
      cell.guessValue !== 0;
    if (isSame) {
      this.ctx.fillStyle = Palette.SameGuessValue;
    }

    this.ctx.fillRect(pox, poy, this.size, this.size);

    this.ctx.textAlign = 'center';
    if (cell.isStateFixed()) {
      this.ctx.fillStyle = Palette.Default;
    } else {
      if (cell.isGuessPassed) {
        this.ctx.fillStyle = Palette.Correct;
      } else {
        this.ctx.fillStyle = Palette.Danger;
      }
    }
    this.ctx.strokeStyle = Palette.DefaultBorder;

    this.ctx.strokeRect(pox, poy, this.size, this.size);
    if (memos.length > 0) {
      const isSame =
        this.parent.selected && cell.hasMemoBy(this.parent.selected.guessValue);
      if (isSame) {
        this.ctx.fillStyle = Palette.SameGuessValue;
        this.ctx.fillRect(pox, poy, this.size, this.size);
        this.ctx.strokeRect(pox, poy, this.size, this.size);
      }

      this.ctx.font = 'bold 8px san-serif';
      // const sliced = this.splitBy(memos, 3);
      if (isSame) {
        this.ctx.fillStyle = Palette.DefaultText;
      }
      const max = Math.max(innerWidth, innerHeight);
      const min = Math.min(innerWidth, innerHeight);
      const ratio = max / min;
      const pad = this.size * 0.1 * ratio;
      memos.forEach((memo, index) => {
        // const slicedText = slice.join("　");
        const { actualBoundingBoxAscent } = this.ctx.measureText('' + memo);
        this.ctx.fillText(
          '' + memo,
          pox + pad * (index % 3) + (this.size / 2 - pad),
          poy +
            (10 / actualBoundingBoxAscent) * ratio * Math.floor(index / 3) +
            pad * Math.floor(index / 3) +
            (this.size / 2 - pad),
        );
      });
    } else {
      this.ctx.font = 'bold 16px san-serif';
      const { actualBoundingBoxAscent } = this.ctx.measureText(value);
      this.ctx.fillText(
        value,
        pox + this.size / 2,
        poy + this.size / 2 + actualBoundingBoxAscent / 2,
      );
    }
  }

  splitBy<T>(array: T[], value: number) {
    const temp = [];
    for (let i = 1; i <= value; i++) {
      const sliced = array.slice((i - 1) * value, i * value);
      temp.push(sliced);
    }
    return temp;
  }

  createButtonGroup(...els: HTMLButtonElement[]) {
    const group = document.createElement('div');
    group.classList.add('btn-group');
    group.append(...els);
    return group;
  }

  renderInputs() {
    const body = document.body;
    const inputs = document.querySelector('#inputs') as HTMLDivElement;
    inputs.innerHTML = '';

    const memoEl = this.convertButtonEl(this.parent.inputManager.memoCell);
    if (this.parent.inputManager.memoMode) {
      memoEl.classList.add('memomode');
    } else {
      memoEl.classList.remove('memomode');
    }

    // 로직 수정
    const removeEl = this.convertButtonEl(this.parent.inputManager.inputs[0]);
    inputs.append(this.createButtonGroup(memoEl, removeEl));

    this.splitBy(
      this.parent.inputManager.inputs
        .slice(1)
        .map((input) => this.convertButtonEl(input)),
      3,
    ).forEach((group) => {
      inputs.append(this.createButtonGroup(...group));
    });

    body.append(inputs);
  }

  convertButtonEl(cellInput: Cell) {
    const value = cellInput.readButtonValue();
    const cell = document.createElement('button');
    if (
      !this.parent.inputManager.memoMode &&
      cellInput.isTypeBoard() &&
      cellInput.current === 0
    ) {
      cell.disabled = true;
    }
    cell.innerText = value;
    if (cellInput.isTypeInput()) {
      cell.dataset.value = '' + cellInput.originValue;
    } else if (cellInput.isTypeMemo()) {
      cell.dataset.value = 'memo';
    }
    return cell;
  }

  drawCellInputs() {
    const { centerX, centerY, boardX, boardY } = this.getGlobalSize();

    for (const cellInput of this.parent.inputManager.inputs) {
      const pox =
        this.inputPlace === 'right'
          ? 10 * this.size + centerX - boardX
          : cellInput.y * this.size +
            centerX -
            boardX +
            Math.floor(cellInput.y / 6) * -this.size;
      const poy =
        this.inputPlace === 'right'
          ? cellInput.y * this.size + centerY - boardY
          : 10 * this.size +
            centerY -
            boardY +
            Math.floor(cellInput.y / 6) * this.size +
            this.parent.offsetTopPx;
      const value =
        '' + (cellInput.guessValue === 0 ? 'X' : cellInput.guessValue);
      this.ctx.font = 'bold 16px san-serif';
      this.ctx.textAlign = 'center';
      this.ctx.strokeStyle = Palette.DefaultBorder;
      if (this.pointer.x === 10 && this.pointer.y === cellInput.y) {
        this.ctx.fillStyle = Palette.Pointer;
      } else {
        this.ctx.fillStyle = Palette.White;
      }
      this.ctx.fillRect(pox, poy, this.size, this.size);

      const { actualBoundingBoxAscent } = this.ctx.measureText(value);

      this.ctx.strokeRect(pox, poy, this.size, this.size);
      this.ctx.fillStyle = Palette.DefaultText;
      this.ctx.fillText(
        value,
        pox + this.size / 2,
        poy +
          this.size / 2 +
          actualBoundingBoxAscent / 2 +
          this.parent.offsetTopPx,
      );
    }
  }

  drawGuideline(pointer: { x: number; y: number }, color: Palette) {
    const { centerX, centerY, boardX, boardY } = this.getGlobalSize();
    const cPox = (_x: number) => _x * this.size + centerX - boardX;
    const cPoy = (_y: number) =>
      _y * this.size + centerY - boardY + this.parent.offsetTopPx;

    /* horizon highlight */
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      cPox(0),
      cPoy(pointer.y),
      this.size * pointer.x,
      this.size,
    );
    this.ctx.fillRect(
      (pointer.x + 1) * this.size + centerX - boardX,
      cPoy(pointer.y),
      this.size * (this.parent.sizes.x - (pointer.x + 1)),
      this.size,
    );
    /* vertical highlight */
    this.ctx.fillRect(
      cPox(pointer.x),
      cPoy(0),
      this.size,
      this.size * pointer.y,
    );
    this.ctx.fillRect(
      cPox(pointer.x),
      cPoy(pointer.y + 1),
      this.size,
      this.size * (this.parent.sizes.y - (pointer.y + 1)),
    );

    /* pointer center */
    this.ctx.fillStyle =
      color === Palette.DangerHighlight
        ? Palette.DangerPointHighlight
        : Palette.Pointer;
    this.ctx.fillRect(cPox(pointer.x), cPoy(pointer.y), this.size, this.size);
  }

  drawBoxBorder() {
    const { centerX, centerY, boardX, boardY } = this.getGlobalSize();
    const borderX = (block: number) => block * 3 * this.size + centerX - boardX;
    const borderY = (block: number) =>
      block * 3 * this.size + centerY - boardY + this.parent.offsetTopPx;

    this.ctx.save();

    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = Palette.BoxBorder;

    this.ctx.strokeRect(borderX(0), borderY(0), this.size * 3, this.size * 3);
    this.ctx.strokeRect(borderX(0), borderY(1), this.size * 3, this.size * 3);
    this.ctx.strokeRect(borderX(0), borderY(2), this.size * 3, this.size * 3);
    this.ctx.strokeRect(borderX(1), borderY(0), this.size * 3, this.size * 3);
    this.ctx.strokeRect(borderX(1), borderY(1), this.size * 3, this.size * 3);
    this.ctx.strokeRect(borderX(1), borderY(2), this.size * 3, this.size * 3);
    this.ctx.strokeRect(borderX(2), borderY(2), this.size * 3, this.size * 3);
    this.ctx.strokeRect(borderX(2), borderY(1), this.size * 3, this.size * 3);
    this.ctx.strokeRect(borderX(2), borderY(0), this.size * 3, this.size * 3);

    this.ctx.restore();
  }

  drawTryInformation() {
    const { centerX, centerY, boardX, boardY } = this.getGlobalSize();
    const borderX = (block: number) => block * 3 * this.size + centerX - boardX;
    const borderY = (block: number) =>
      block * 3 * this.size + centerY - boardY + this.parent.offsetTopPx;

    this.ctx.fillStyle = Palette.DefaultText;
    this.ctx.fillText(
      `⏱️ ${format(this.parent.timer)}`,
      borderX(1.5),
      borderY(-0.2) - 25,
    );
    this.ctx.fillText(
      `Lv.${this.parent.level} [ ${grade[this.parent.level as 1 | 2 | 3]} ] (${
        this.parent.tryAmount
      } / ${this.parent.tryLimit})`,
      borderX(1.5),
      borderY(-0.2),
    );
  }

  renderCanvas(time: number) {
    this.activeValue = requestAnimationFrame(this.renderCanvas.bind(this));

    time = Math.floor(time * 0.001);

    if (time !== this.beforeTime) {
      // if you want
      if (this.parent.isStateRun()) {
        this.parent.timer += 1;
      }
    }

    if (this.parent.inputManager.resetQueue.length > 0) {
      const cellReset = this.parent.inputManager.resetQueue.shift();
      if (cellReset) {
        const cb = () => {
          cellReset.isSuccess = false;
        };
        const timeout = setTimeout(cb, 3 * 1000);
        this.timeoutQueue.push([timeout, cb]);
      }
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const cell of this.parent.boards.flat(1)) {
      this.drawCell(cell);
    }

    if (
      0 <= this.pointer.x &&
      this.pointer.x < this.parent.sizes.x &&
      0 <= this.pointer.y &&
      this.pointer.y < this.parent.sizes.y
    ) {
      this.drawGuideline(this.pointer, Palette.LineHighlight);
    }

    if (this.parent.wrongCell) {
      const { x, y } = this.parent.wrongCell;
      this.drawGuideline({ x, y }, Palette.DangerHighlight);
    }

    this.drawBoxBorder();

    this.drawTryInformation();
    this.beforeTime = time;
  }

  render() {
    this.parent.wrongCell = null;
    this.activeValue = requestAnimationFrame(this.renderCanvas.bind(this));
  }
}
