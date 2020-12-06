import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import json from '@rollup/plugin-json';

export default {
  input: 'src/main.ts',
  output: {
    dir: './dist',
    sourcemap: 'inline',
    format: 'cjs',
    exports: 'default',
  },
  external: ['obsidian', 'electron', 'fs', 'util', 'path'],
  plugins: [
    typescript(),
    nodeResolve({ browser: true }),
    commonjs(),
    json(),
    copy({
      targets: [
        {
          src: ['manifest.json'],
          // , 'styles.css'],
          dest: 'dist',
        },
      ],
    }),
  ],
};
