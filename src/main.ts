import Sudoku from "./core/sudoku";

const search = location.search;
const query = Object.fromEntries(
  [
    ...new URLSearchParams(
      search.startsWith("?") ? search.slice(1) : "level=0"
    ).entries(),
  ].map(([k, v]) => [k, Number(v) || 0])
);

const sudoku = new Sudoku();
sudoku.setLevel(query.level);

sudoku.run();

// console.log("sudoku state:", sudoku.state);
