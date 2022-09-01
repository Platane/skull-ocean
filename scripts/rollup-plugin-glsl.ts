import { createFilter } from "rollup-pluginutils";
import { Plugin, TransformHook } from "rollup";

export const glsl = (
  opts: {
    include?: Parameters<typeof createFilter>[0];
    exclude?: Parameters<typeof createFilter>[1];
    compress?: boolean;
  } = {}
) => {
  if (!opts.include) {
    throw Error("include option should be specified");
  }

  const filter = createFilter(opts.include, opts.exclude);

  const transform: TransformHook = (code, id) => {
    if (filter(id)) {
      if (opts.compress) {
        code = code
          // remove comment
          .replace(/\/\/[^\n]*/g, "\n")

          // pack multiple line break
          .replace(/\s*\n\s*/g, "\n")

          // pack white spaces
          .replace(/[\t ]+/g, " ")

          // remove white spaces when not between two words
          .replace(/[^\w]([ \n])+/g, (a) => a.trim())
          .replace(/([ \n])+[^\w]/g, (a) => a.trim())
          .trim();
      }

      return {
        code: `export default ${JSON.stringify(code)};`,
        map: { mappings: "" },
      };
    }
  };

  return { name: "glsl", transform } as Plugin;
};
