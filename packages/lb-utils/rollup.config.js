
import esbuild from 'rollup-plugin-esbuild';
import json from '@rollup/plugin-json';

const CJS_OUTPUT_DIR = 'dist';
const ES_OUTPUT_DIR = 'es';

const isProd = process.env.NODE_ENV === 'production';
export default {
  input: 'src/index.ts',
  output: [
    {
      format: 'es',
      dir: ES_OUTPUT_DIR,
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    ...(isProd
      ? [
          {
            format: 'cjs',
            dir: CJS_OUTPUT_DIR,
            preserveModules: true,
            preserveModulesRoot: 'src',
          },
        ]
      : []),
  ],
  onwarn: () => {},
  plugins: [
    json(),
    esbuild({
      include: /\.[jt]s?x?$/,
      exclude: /node_modules/,
      target: 'es2015', // default, or 'es20XX', 'esnext'
    })]
}