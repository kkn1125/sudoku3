import { defineConfig, loadEnv } from 'vite';
import dotenv from 'dotenv';
import path from 'path';

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.

  dotenv.config({
    path: path.join(path.resolve(), '.env'),
  });

  const env = loadEnv(mode, process.cwd(), '');

  const HOST = process.env.HOST;
  const PORT = Number(process.env.PORT) || 5000;

  const MODE = process.env.NODE_ENV || 'production';
  const BASE = MODE !== 'production' ? '/sudoku3/' : process.env.BASE;

  return {
    // vite config
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    server: {
      host: HOST,
      port: PORT,
    },
    base: MODE === 'production' ? BASE : '/',
    build: {
      minify: true,
      cssMinify: true,
    },
  };
});
