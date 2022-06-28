import esbuild from 'rollup-plugin-esbuild';
import image from '@rollup/plugin-image';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import sass from 'sass';
import url from 'postcss-url';

import path from 'path';

const customResolver = resolve({
  extensions: ['.tsx', '.ts', 'scss'],
});

const sassLoader = (context) => {
  return new Promise((resolve, reject) => {
    sass.render(
      {
        file: context,
      },
      (err, result) => {
        if (!err) {
          resolve(result.css);
        } else {
          reject(err);
        }
      },
    );
  });
};

const projectRootDir = path.resolve(__dirname);

const CJS_OUTPUT_DIR = 'dist';
const ES_OUTPUT_DIR = 'es';
const isProd = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.tsx',
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
    // TODO: COPY ICON TO ES DIR
    postcss({
      extract: true,
      assetsPath: './assets',
      extensions: ['scss'],
      plugins: [
        url({
          url: 'copy',
          assetsPath: path.resolve('./dist/assets/icons'),
          useHash: true,
        }),
      ],
      process: sassLoader,
    }),
  ],
  external: ['react', 'antd'],
};
