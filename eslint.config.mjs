import pluginJs from '@eslint/js';
import perfectionist from 'eslint-plugin-perfectionist';
import pluginSecurity from 'eslint-plugin-security';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
	{ files: ['**/*.{js,mjs,cjs,ts}'] },
	{ languageOptions: { globals: globals.browser } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	perfectionist.configs['recommended-natural'],
	pluginSecurity.configs.recommended,
	{
		ignores: [
			'**/temp.js',
			'config/*',
			'node_modules/',
			'.serverless/',
			'dist/',
			'build/',
			'.eslintcache',
			'npm-debug.log*',
			'yarn-debug.log*',
			'yarn-error.log*',
			'.env',
			'.env.local',
			'.env.development',
			'.env.test',
			'.env.production',
			'.vscode/',
			'.idea/',
			'*.iml',
			'.DS_Store',
			'coverage/',
			'tmp/',
			'temp/',
		],
	},
];
