/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import pluginJs from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import perfectionist from 'eslint-plugin-perfectionist';
import pluginSecurity from 'eslint-plugin-security';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
	{ files: ['**/*.{js,mjs,cjs,ts}'] },
	{
		languageOptions: {
			globals: globals.node,
			parser: tseslint,
			parserOptions: {
				ecmaVersion: 2021,
				project: './tsconfig.json',
				sourceType: 'module',
				tsconfigRootDir: process.cwd(),
			},
		},
	},
	pluginJs.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	pluginSecurity.configs.recommended,
	perfectionist.configs['recommended-natural'],
	eslintPluginUnicorn.configs['flat/recommended'],
	{
		plugins: {
			import: importPlugin,
		},
		rules: {
			'@typescript-eslint/explicit-function-return-type': ['error'],
			'@typescript-eslint/no-unnecessary-type-assertion': 'error',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					ignoreRestSiblings: true,
					varsIgnorePattern: '^_',
				},
			],
			'import/extensions': ['error', 'always', { js: 'always', ts: 'never' }],
			'unicorn/no-nested-ternary': 'off',
			'unicorn/prefer-string-raw': 'off',
			'unicorn/prevent-abbreviations': 'off',
		},
	},
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
