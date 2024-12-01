const config = {
	semi: true,
	singleQuote: true,
	jsxSingleQuote: true,
	bracketSpacing: true,
	bracketSameLine: false,
	arrowParens: 'always',
	tabWidth: 2,
	useTabs: true,
	printWidth: 160,
	importOrder: ['^@core/(.*)$', '^@server/(.*)$', '^@ui/(.*)$', '^[./]'],
	importOrderSeparation: true,
	importOrderSortSpecifiers: true,
	plugins: ['@trivago/prettier-plugin-sort-imports'],
};

export default config;
