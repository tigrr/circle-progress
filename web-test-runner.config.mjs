import { playwrightLauncher } from '@web/test-runner-playwright'

/**
 * @type {import('@web/test-runner').TestRunnerConfig}
 */
export default {
    rootDir: '.',
	files: 'test/**/*.test.js',
    concurrentBrowsers: 3,
    nodeResolve: true,
    browsers: [
        playwrightLauncher({ product: 'chromium' }),
        playwrightLauncher({ product: 'firefox' }),
        playwrightLauncher({ product: 'webkit' }),
    ],
}
