import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts'
import esbuild, { minify } from 'rollup-plugin-esbuild'

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
					minify(),
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
