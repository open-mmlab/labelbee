import esbuild from 'rollup-plugin-esbuild';
import image from '@rollup/plugin-image';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';

import path from 'path';

const customResolver = resolve({
  extensions: ['.tsx', '.ts', 'scss'],
});

const projectRootDir = path.resolve(__dirname);

const OUTPUT_DIR = 'dist';
const isProd = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.tsx',
  output: [
    {
      format: 'es',
      dir: OUTPUT_DIR,
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
  ],
  plugins: [
    alias({
      entries: [
        { find: '@', replacement: path.resolve(projectRootDir, './src') },
        { find: 'src', replacement: path.resolve(projectRootDir, './src') },
      ],
      customResolver,
    }),
    image(),
    esbuild({
      // All options are optional
      include: /\.[jt]s?x?$/, // default, inferred from `loaders` option
      exclude: /node_modules/, // default
      minify: isProd,
      target: 'es2015', // default, or 'es20XX', 'esnext'
      define: {
        __VERSION__: '"x.y.z"',
      },
      tsconfig: 'tsconfig.json', // default
      // Add extra loaders
      loaders: {
        // Add .json files support
        // require @rollup/plugin-commonjs
        '.json': 'json',
        // Enable JSX in .js files too
        '.js': 'jsx',
      },
    }),
  ],
  external: ['react', 'antd'],
};
