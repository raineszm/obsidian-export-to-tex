import esbuild from "esbuild";
import process from "process";

const banner =
  `/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`;

const prod = (process.argv[2] === 'production');

esbuild.build({
  banner: {
    js: banner,
  },
  entryPoints: ['src/main.ts'],
  bundle: true,
  define: {"DEBUG": !prod},
  external: [ 'obsidian' ],
  format: 'cjs',
  // watch: !prod,
  target: 'es2016',
  logLevel: "info",
  sourcemap: prod ? false : 'inline',
  treeShaking: true,
  outdir: 'dist',
  entryNames: '[name]'
}).catch(() => process.exit(1));
