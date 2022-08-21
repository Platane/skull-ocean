import { createFilter } from "rollup-pluginutils";
import { Plugin, TransformHook } from "rollup";
import { GlslMinify } from "webpack-glsl-minify/build/minify";

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

  const minifier = new GlslMinify({ preserveUniforms: true });

  const transform: TransformHook = async (code, id) => {
    if (filter(id)) {
      if (opts.compress) {
        const shader = await minifier.execute(code);
        code = code.replace(/\s*\n\s*/g, "\n").replace(/[\t ]+/g, " ");
      }

      return {
        code: `export default ${JSON.stringify(code)};`,
        map: { mappings: "" },
      };
    }
  };

  return { name: "glsl", transform } as Plugin;
};
