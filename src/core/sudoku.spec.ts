/**
 * @jest-environment jsdom
 */

import Sudoku from './sudoku';

describe('[스도쿠 엔진 테스트]', () => {
  let sudoku: Sudoku;

  /* 초기 시작 시 스도쿠 정의 */
  beforeAll(() => {
    sudoku = new Sudoku();
  });
  /* 각 테스트마다 스도쿠 엔진 초기화 */
  afterEach(() => {
    sudoku.run();
    expect(sudoku.state).toStrictEqual('init');
  });

  /* 스도쿠 엔진 테스트 */
  it('[스도쿠 엔진: 정의] success', () => {
    expect(sudoku).toBeDefined();
  });

  it('[스도쿠 엔진: 실행] success', () => {
    sudoku.run();
    expect(sudoku.state).toStrictEqual('running');
  });

  it('[스도쿠 엔진: 맵 생성] success', () => {
    sudoku.run();
    expect(sudoku.boards.length).toStrictEqual(9);
    expect(sudoku.boards[0].length).toStrictEqual(9);
  });

  it('[스도쿠 엔진: 셀 선택] success', () => {
    sudoku.run();

    const selectOneSpy = jest.spyOn(sudoku, 'selectOne');

    const cell = sudoku.selectOne(1, 1);

    expect(cell).toBeDefined();
    expect(selectOneSpy).toHaveBeenCalled();
    expect(selectOneSpy).toHaveBeenCalledTimes(1);
    expect(selectOneSpy).toHaveBeenCalledWith(1, 1);
    expect(cell.guessValue).toStrictEqual(0);
    expect(cell.isMatchedWithOrigin()).toStrictEqual(false);
  });

  it('[스도쿠 엔진: 셀 열 선택] success', () => {
    sudoku.run();

    const selectColumnSpy = jest.spyOn(sudoku, 'selectColumn');

    const columns = sudoku.selectColumn(1);

    expect(columns).toBeDefined();
    expect(selectColumnSpy).toHaveBeenCalled();
    expect(selectColumnSpy).toHaveBeenCalledTimes(1);
    expect(selectColumnSpy).toHaveBeenCalledWith(1);
    expect(columns.length).toStrictEqual(9);
    expect(sudoku.isCorrect(columns)).toBeFalsy();
  });

  it('[스도쿠 엔진: 랜덤 맞추기 셀 선택] success', () => {
    const randomizeCellsSpy = jest.spyOn(sudoku, 'createRandomFixedCells');

    const randomizeCells1 = sudoku.createRandomFixedCells(5);
    const randomizeCells2 = sudoku.createRandomFixedCells(8);

    expect(randomizeCells1).toBeDefined();
    expect(randomizeCells2).toBeDefined();
    expect(randomizeCellsSpy).toHaveBeenCalled();
    expect(randomizeCellsSpy).toHaveBeenCalledTimes(2);
    expect(randomizeCellsSpy).toHaveBeenCalledWith(5);
    expect(randomizeCellsSpy).toHaveBeenCalledWith(8);
    expect(randomizeCells1.length).toStrictEqual(5);
    expect(randomizeCells2.length).toStrictEqual(8);
  });
});
