import * as fs from "fs";
import * as path from "path";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import { rollup, InputOptions, RollupOptions } from "rollup";
import { minify as minifyHtml } from "html-minifier-terser";
import { minify, MinifyOptions } from "terser";
import compiler from "@ampproject/rollup-plugin-closure-compiler";
import { execFileSync } from "child_process";
import { glsl } from "./rollup-plugin-glsl";
// @ts-ignore
import advzipBin from "advzip-bin";
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

const formatSize = (s: number) => (s / 1024).toFixed(2) + "K";

export const build = async () => {
  // bundle with rollup
  const bundle = await rollup(createRollupInputOptions(true));
  let {
    output: [{ code }],
  } = await bundle.generate(rollupOutputOptions);

  // minify with terser
  {
    const out = await minify(code, terserOptions);
    code = out.code!;
  }

  const htmlContent = fs
    .readFileSync(path.join(__dirname, "..", "src", "index.html"))
    .toString();

  const minifiedHtmlContent = await minifyHtml(
    htmlContent.replace(
      '<script src="../dist/bundle.js"></script>',
      `<script>${code!}</script>`
    ),
    minifyHtmlOptions
  );

  const distDir = path.join(__dirname, "..", "dist");
  try {
    fs.rmSync(distDir, { recursive: true });
  } catch (err) {}
  fs.mkdirSync(distDir, { recursive: true });

  fs.writeFileSync(path.join(distDir, "index.html"), minifiedHtmlContent);

  execFileSync(advzipBin, [
    "--add",
    "--shrink-insane",
    path.join(distDir, "bundle.zip"),
    ...listFiles(distDir),
  ]);

  const size = fs.statSync(path.join(distDir, "bundle.zip")).size;
  console.log(`${size}o`.padEnd(10, " ") + `\t(${formatSize(size)}o)`);
};

const listFiles = (filename: string): string[] => {
  const stat = fs.statSync(filename);
  if (stat.isFile()) return [filename];
  if (stat.isDirectory())
    return fs
      .readdirSync(filename)
      .map((f) => listFiles(path.join(filename, f)))
      .flat();
  return [];
};
