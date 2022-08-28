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
          .replace(/\s*\n\s*/g, "\n")
          .replace(/[\t ]+/g, " ")
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
