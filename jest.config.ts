import type { Config } from "jest";

const config: Config = {
  verbose: true,
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "\\.[jt]s?$": "ts-jest",
  },
  setupFiles: ["jest-canvas-mock"],
};

export default config;
