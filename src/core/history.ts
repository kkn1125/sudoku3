export default class History {
  score: number;
  playTime: number;
  firstCorrectTime: number;
  firstFailureTime: number;

  /* 정지 횟수 */
  pauseAmount: number;

  constructor() {
    this.score = 0;
    this.playTime = 0;
    this.firstCorrectTime = 0;
    this.firstFailureTime = 0;
    this.pauseAmount = 0;
  }
}
