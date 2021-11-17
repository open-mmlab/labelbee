import esbuild from 'rollup-plugin-esbuild';
// 为了支持import xx from 'xxx'
import resolve from '@rollup/plugin-node-resolve';
// 读取package.json
// 代码生成sourcemaps
// import sourceMaps from 'rollup-plugin-sourcemaps'

import pkg from './package.json';
import svg from 'rollup-plugin-svg';
import path from 'path';
import alias from '@rollup/plugin-alias';

const projectRootDir = path.resolve(__dirname);
const customResolver = resolve({
  extensions: ['.tsx', '.ts', 'scss'],
});
const OUTPUT_DIR = 'dist';
const isProd = process.env.NODE_ENV === 'production';

// 代码头
const banner = `
  /* eslint-disable */
  /*!
  * sense-annotation v${pkg.version}
  * (c) 2020-${new Date().getFullYear()}
  * Released under the MIT License.
  */
`;

console.log('beehive- annotation isProd ', isProd);

export default {
  input: ['./src/index.ts'],
  coverageDirectory: './dist/',
  plugins: [
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
      format: 'cjs',
      file: './dist/index.js',
      banner,
    },
    {
      format: 'es',
      file: './es/index.js',
      banner,
    },
  ],
};
