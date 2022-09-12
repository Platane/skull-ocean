import * as fs from "fs";
import * as path from "path";
import { rollup } from "rollup";
import { minify as minifyHtml } from "html-minifier-terser";
import { minify, MinifyOptions } from "terser";
import { execFileSync } from "child_process";
// @ts-ignore
import advzipBin from "advzip-bin";
import { packGeometry } from "./pack-geometry";
import {
  createRollupInputOptions,
  minifyHtmlOptions,
  rollupOutputOptions,
  terserOptions,
} from "./rollup-config";

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
      '<script src="bundle.js"></script>',
      `<script>${code!}</script>`
    ),
    minifyHtmlOptions
  );

  const distDir = path.join(__dirname, "..", "dist");
  try {
    fs.rmSync(distDir, { recursive: true });
  } catch (err) {}
  fs.mkdirSync(distDir, { recursive: true });

  await packGeometry();

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
