import fs from 'node:fs/promises'
import terser from '@rollup/plugin-terser'
import pkg from './package.json' assert { type: 'json' }

const clean = (path) => ({
	name: 'clean',
	buildStart() {
		fs.rm(path, {recursive: true, force: true})
	},
})

const banner = `/*!
 * Circle Progress - v${pkg.version} - ${new Date().toISOString().slice(0, 10)}
 * ${pkg.homepage}
 * Copyright (c) ${pkg.author.name}
 * Licensed ${pkg.license}
 */`

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
	input: 'src/circle-progress.js',
	plugins: [clean('dist')],
	output: [
		{
			file: 'dist/circle-progress.js',
			format: 'es',
			sourcemap: true,
			banner,
		},
		{
			file: 'dist/circle-progress.min.js',
			format: 'es',
			sourcemap: true,
			banner,
			plugins: [terser()],
		},
	]
}
