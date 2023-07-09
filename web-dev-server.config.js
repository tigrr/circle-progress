import { importMapsPlugin } from '@web/dev-server-import-maps'

export default {
	plugins: [
		importMapsPlugin({
			inject: {
				importMap: {
					// Resolve to local file during development
					imports: { 'https://cdn.jsdelivr.net/npm/js-circle-progress/dist/circle-progress.min.js': '/src/circle-progress.js' },
				},
			},
		}),
	],
}
