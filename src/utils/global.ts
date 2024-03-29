const grade = {
  "0": "처음하는 사람",
  "1": "초급자",
  "2": "중급자",
  "3": "고급자",
  "4": "숙련자",
  "5": "전문가",
};

const format = (time: number) => {
  const hour = Math.floor((time / 60 / 60) % 60)
    .toString()
    .padStart(2, "0");
  const minute = Math.floor((time / 60) % 60)
    .toString()
    .padStart(2, "0");
  const second = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${hour}:${minute}:${second}`;
};

export { grade, format };
