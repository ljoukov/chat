import adapter from '@sveltejs/adapter-auto';
import path from 'node:path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		alias: {
			'@ljoukov/chat': path.resolve(import.meta.dirname, '../../src/lib/index.ts'),
			$demo: path.resolve(import.meta.dirname, '../_shared/src/lib')
		}
	}
};

export default config;
