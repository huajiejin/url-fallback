import dts from 'rollup-plugin-dts'
import esbuild, { minify } from 'rollup-plugin-esbuild'
import { getBabelOutputPlugin } from '@rollup/plugin-babel'
import path from 'path'

const name = require('./package.json').main.replace(/\.js$/, '')

const bundle = config => ({
  ...config,
  input: 'src/public-api.ts',
  external: id => !/^[./]/.test(id),
})

export default [
  bundle({
    plugins: [
			esbuild(),
		],
    output: [
      {
        file: `${name}.js`,
        format: 'cjs',
        sourcemap: true,
				plugins: [
					getBabelOutputPlugin({
						configFile: path.resolve(__dirname, 'babel.config.js')
					}),
				]
      },
      {
        file: `${name}.min.js`,
        format: 'cjs',
        sourcemap: true,
				plugins: [
					getBabelOutputPlugin({
						configFile: path.resolve(__dirname, 'babel.config.js')
					}),
					minify(),
				]
      },
      {
        file: `${name}.mjs`,
        format: 'es',
        sourcemap: true,
      },
      {
        file: `${name}.esm.js`,
        format: 'esm',
        sourcemap: true,
      },
    ],
  }),
  bundle({
    plugins: [dts()],
    output: {
      file: `${name}.d.ts`,
      format: 'es',
    },
  }),
]