import path from "path";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import * as pkg from "./package.json";
import dts from 'vite-plugin-dts';

const NODE_ENV = process.argv.mode || "development";
const VERSION = pkg.version;

export default {
  build: {
    copyPublicDir: false,
    lib: {
      entry: path.resolve(__dirname, "src", "index.js"),
      name: "Table",
      fileName: "table",
    },
  },
  define: {
    NODE_ENV: JSON.stringify(NODE_ENV),
    VERSION: JSON.stringify(VERSION),
  },
  server: {
    open: true, 
    watch: {
      usePolling: true, 
    },
  },
  plugins: [
    cssInjectedByJsPlugin({ useStrictCSP: true }),
    dts({ tsconfigPath: './tsconfig.json' })
  ],
};
