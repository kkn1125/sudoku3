import Cell from "./cell";

export default class CellInput extends Cell {
  amount: number = 9;
  current: number = 0;

  count() {
    this.current += 1;
  }

  clear() {
    this.current = 0;
  }
}
