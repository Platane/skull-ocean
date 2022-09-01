import * as path from "path";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import { InputOptions, RollupOptions } from "rollup";
import { MinifyOptions } from "terser";
import compiler from "@ampproject/rollup-plugin-closure-compiler";
import { glsl } from "./rollup-plugin-glsl";
// @ts-ignore
import babelPluginDefine from "babel-plugin-transform-define";
// @ts-ignore
import babelPresetTypescript from "@babel/preset-typescript";

export const terserOptions: MinifyOptions = {
  compress: {
    keep_infinity: true,
    pure_getters: true,
    unsafe_arrows: true,
    unsafe_math: true,
    unsafe_methods: true,
    inline: true,
    booleans_as_integers: true,
    passes: 10,
  },
  format: {
    wrap_func_args: false,
    comments: false,
  },
  mangle: { properties: true, toplevel: true },
  ecma: 2020,
  toplevel: true,
};

export const minifyHtmlOptions = {
  collapseWhitespace: true,
  useShortDoctype: true,
  minifyCSS: true,
};

export const createRollupInputOptions = (production: boolean) =>
  ({
    input: path.resolve(__dirname, "..", "src", "index.ts"),

    plugins: [
      commonjs(),

      resolve({
        extensions: [".ts", ".js"],
      }),

      babel({
        babelHelpers: "bundled",
        babelrc: false,
        extensions: [".ts", ".js"],
        presets: [
          //
          babelPresetTypescript,
        ],
        plugins: [
          [
            babelPluginDefine,
            {
              "process.env.NODE_ENV": production ? "production" : "dev",
            },
          ],
        ],
      }),

      glsl({
        include: ["**/*.frag", "**/*.vert"],
        compress: production,
        // compress: true,
      }),

      ...(production
        ? [
            compiler({
              language_in: "ECMASCRIPT_2020",
              language_out: "ECMASCRIPT_2020",
              compilation_level: "ADVANCED",
              // assume_function_wrapper: true,
            }),
          ]
        : []),
    ],
  } as InputOptions);

export const rollupOutputOptions: RollupOptions = {
  output: {
    format: "es",
    sourcemap: false,
  },
};
