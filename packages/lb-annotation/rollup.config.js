import esbuild from 'rollup-plugin-esbuild';
import resolve from '@rollup/plugin-node-resolve';
import svg from 'rollup-plugin-svg';
import path from 'path';
import alias from '@rollup/plugin-alias';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';

const projectRootDir = path.resolve(__dirname);
const customResolver = resolve({
  extensions: ['.tsx', '.ts', 'scss'],
});
const CJS_OUTPUT_DIR = 'dist';
const ES_OUTPUT_DIR = 'es';
const isProd = process.env.NODE_ENV === 'production';

export default {
  input: ['./src/index.ts'],
  coverageDirectory: './dist/',
  plugins: [
    webWorkerLoader(/* configuration */ { targetPlatform: 'browser' }),
    alias({
      entries: [{ find: '@', replacement: path.resolve(projectRootDir, './src') }],
      customResolver,
    }),
    svg(),
    esbuild({
      // All options are optional
      include: /\.[jt]s?x?$/, // default, inferred from `loaders` option
      exclude: /node_modules/, // default
      sourceMap: true, // default
      minify: isProd,
      // minify: false,
      target: 'es2015', // default, or 'es20XX', 'esnext'
      define: {
        __VERSION__: '"x.y.z"',
      },
      tsconfig: 'tsconfig.json', // default
      // Add extra loaders
      loaders: {
        '.json': 'json',
        '.js': 'jsx',
      },
    }),
  ],
  output: [
    {
      format: 'es',
      dir: ES_OUTPUT_DIR,
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    {
      format: 'cjs',
      dir: CJS_OUTPUT_DIR,
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
  ],
};
