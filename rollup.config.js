import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import { babel } from '@rollup/plugin-babel'
import { DEFAULT_EXTENSIONS } from '@babel/core'
import { terser } from "rollup-plugin-terser"

const babelPlugin = babel({
	babelHelpers: 'bundled',
	extensions: [ ...DEFAULT_EXTENSIONS, 'ts' ],
	presets: [ ['@babel/preset-env'] ],
})

export default defineConfig([
	{
		plugins: [
			esbuild(),
		],
		input: 'src/public-api.ts',
		output: [
      {
        file: `dist/url-fallback.js`,
        format: 'cjs',
      },
      {
        file: `dist/url-fallback.esm.js`,
        format: 'es',
      },
		],
	},
	{
		plugins: [
			esbuild(),
			babelPlugin,
		],
		input: 'src/public-api.ts',
		output: [
      {
        file: `dist/url-fallback.lib.iife.js`,
        format: 'iife',
				name: 'UrlFallback',
      },
      {
        file: `dist/url-fallback.lib.iife.min.js`,
        format: 'iife',
				name: 'UrlFallback',
        sourcemap: true,
				plugins: [
					terser(),
				],
      },
		],
	},
	{
		plugins: [
			esbuild(),
			babelPlugin,
		],
		input: 'src/browser-script.ts',
		output: [
      {
        file: `dist/url-fallback.iife.js`,
        format: 'iife',
				name: 'UrlFallback',
      },
      {
        file: `dist/url-fallback.iife.min.js`,
        format: 'iife',
				name: 'UrlFallback',
        sourcemap: true,
				plugins: [
					terser(),
				],
      },
		],
	},
	{
		plugins: [
			dts(),
		],
		input: 'src/public-api.ts',
		output: {
      file: `dist/url-fallback.d.ts`,
      format: 'es',
    },
	},
])
