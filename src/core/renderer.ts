import Cell from "../modules/cell";
import { CellState, Palette } from "../types/sudoku.type";
import Sudoku from "./sudoku";

export default class Renderer {
  parent: Sudoku;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  size: number = 50;
  pointer: { x: number; y: number } = { x: -1, y: -1 };
  selected: { x: number; y: number } = { x: -1, y: -1 };
  wrongCell: Cell | null = null;

  inputPlace: "right" | "bottom" = "right";

  constructor(sudoku: Sudoku) {
    const CANVAS = document.querySelector("#app") as HTMLCanvasElement;
    const ctx = CANVAS.getContext("2d") as CanvasRenderingContext2D;
    this.parent = sudoku;
    this.canvas = CANVAS;
    this.ctx = ctx;

    this.renderInputs();

    this.execListener();
  }

  getGlobalSize() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const boardX = (this.parent.boards[0].length * this.size) / 2;
    const boardY = (this.parent.boards.length * this.size) / 2;
    return {
      centerX,
      centerY,
      boardX,
      boardY,
    };
  }

  execListener() {
    this.handleResizeCanvas();
    window.addEventListener("resize", this.handleResizeCanvas.bind(this));
  }

  maxOr(mediaSize: number) {
    return innerWidth < mediaSize;
  }
  minAndMax(minMediaSize: number, maxMediaSize: number) {
    return minMediaSize <= innerWidth && innerWidth < maxMediaSize;
  }

  handleResizeCanvas(_e?: UIEvent) {
    this.canvas.width = innerWidth;
    this.canvas.height = innerHeight;

    if (this.minAndMax(1024, 1268)) {
      this.size = 50;
      this.inputPlace = "right";
    } else if (this.minAndMax(768, 1024)) {
      this.size = 46;
      this.inputPlace = "right";
    } else if (this.minAndMax(568, 768)) {
      this.size = 40;
      this.inputPlace = "right";
    } else if (this.minAndMax(368, 568)) {
      this.size = 28;
      this.inputPlace = "right";
    } else if (this.maxOr(368)) {
      this.size = 26;
      this.inputPlace = "right";
    } else {
      this.size = 50;
      this.inputPlace = "right";
    }
  }

  renderCanvas(time: number) {
    requestAnimationFrame(this.renderCanvas.bind(this));

    time = time * 0.001;

    if (this.parent.inputManager.resetQueue.length > 0) {
      const cellReset = this.parent.inputManager.resetQueue.shift();
      if (cellReset) {
        setTimeout(() => {
          cellReset.isSuccess = false;
        }, 3 * 1000);
      }
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const cell of this.parent.boards.flat(1)) {
      this.drawCell(cell, time);
    }

    if (
      0 <= this.pointer.x &&
      this.pointer.x < this.parent.sizes.x &&
      0 <= this.pointer.y &&
      this.pointer.y < this.parent.sizes.y
    ) {
      this.drawGuideline(this.pointer, Palette.LineHighlight);
    }

    if (this.wrongCell) {
      const { x, y } = this.wrongCell;
      this.drawGuideline({ x, y }, Palette.DangerHighlight);
    }

    // this.drawCellInputs();

    this.drawBoxBorder();

    this.drawTryInformation();
  }

  drawCell(cell: Cell, time: number) {
    const { centerX, centerY, boardX, boardY } = this.getGlobalSize();
    const { x, y, originValue, guessValue, /* memo, */ state } = cell;
    const pox = x * this.size + centerX - boardX;
    const poy = y * this.size + centerY - boardY;

    const value =
      "" + ((state === CellState.Fixed ? originValue : guessValue) || "");

    this.ctx.fillStyle = Palette.White;

    if (cell.isSuccess) {
      this.ctx.fillStyle = Palette.Success;
    }

    /* selected cell highlight */
    if (
      this.parent.selected?.x === cell.x &&
      this.parent.selected?.y === cell.y
    ) {
      this.ctx.fillStyle = Palette.Selected;
    }

    if (
      this.parent.selected?.guessValue === cell.guessValue &&
      cell.guessValue !== 0
    ) {
      this.ctx.fillStyle = Palette.SameGuessValue;
    }

    this.ctx.fillRect(pox, poy, this.size, this.size);

    this.ctx.font = "bold 16px san-serif";
    this.ctx.textAlign = "center";
    if (state === CellState.Fixed) {
      this.ctx.fillStyle = Palette.Default;
    } else {
      if (cell.isGuessPassed) {
        this.ctx.fillStyle = Palette.Correct;
      } else {
        this.ctx.fillStyle = Palette.Danger;
      }
    }
    this.ctx.strokeStyle = Palette.DefaultBorder;

    const { actualBoundingBoxAscent } = this.ctx.measureText(value);

    this.ctx.strokeRect(pox, poy, this.size, this.size);
    this.ctx.fillText(
      value,
      pox + this.size / 2,
      poy + this.size / 2 + actualBoundingBoxAscent / 2
    );
  }

  renderInputs() {
    const body = document.body;
    const inputs = document.createElement("div");
    inputs.id = "inputs";
    for (const cellInput of this.parent.inputManager.inputs) {
      const value =
        "" + (cellInput.guessValue === 0 ? "X" : cellInput.guessValue);
      const cell = document.createElement("button");
      cell.innerText = value;
      cell.dataset.value = "" + cellInput.guessValue;
      inputs.append(cell);
    }
    body.append(inputs);
  }

  drawCellInputs() {
    const { centerX, centerY, boardX, boardY } = this.getGlobalSize();

    for (const cellInput of this.parent.inputManager.inputs) {
      const pox =
        this.inputPlace === "right"
          ? 10 * this.size + centerX - boardX
          : cellInput.y * this.size +
            centerX -
            boardX +
            Math.floor(cellInput.y / 6) * -this.size;
      const poy =
        this.inputPlace === "right"
          ? cellInput.y * this.size + centerY - boardY
          : 10 * this.size +
            centerY -
            boardY +
            Math.floor(cellInput.y / 6) * this.size;
      const value =
        "" + (cellInput.guessValue === 0 ? "X" : cellInput.guessValue);
      this.ctx.font = "bold 16px san-serif";
      this.ctx.textAlign = "center";
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
        poy + this.size / 2 + actualBoundingBoxAscent / 2
      );
    }
  }

  drawGuideline(pointer: { x: number; y: number }, color: Palette) {
    const { centerX, centerY, boardX, boardY } = this.getGlobalSize();
    const cPox = (_x: number) => _x * this.size + centerX - boardX;
    const cPoy = (_y: number) => _y * this.size + centerY - boardY;

    /* horizon highlight */
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      centerX - boardX,
      pointer.y * this.size + centerY - boardY,
      this.size * pointer.x,
      this.size
    );
    this.ctx.fillRect(
      (pointer.x + 1) * this.size + centerX - boardX,
      pointer.y * this.size + centerY - boardY,
      this.size * (this.parent.sizes.x - (pointer.x + 1)),
      this.size
    );
    /* vertical highlight */
    this.ctx.fillRect(
      pointer.x * this.size + centerX - boardX,
      centerY - boardY,
      this.size,
      this.size * pointer.y
    );
    this.ctx.fillRect(
      pointer.x * this.size + centerX - boardX,
      (pointer.y + 1) * this.size + centerY - boardY,
      this.size,
      this.size * (this.parent.sizes.y - (pointer.y + 1))
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
    const borderY = (block: number) => block * 3 * this.size + centerY - boardY;

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
    const borderY = (block: number) => block * 3 * this.size + centerY - boardY;

    this.ctx.fillStyle = Palette.DefaultText;
    this.ctx.fillText(
      "Fail to guess: " + this.parent.tryAmount + " / " + this.parent.tryLimit,
      borderX(1.5),
      borderY(-0.2)
    );
  }

  render() {
    requestAnimationFrame(this.renderCanvas.bind(this));
  }
}
