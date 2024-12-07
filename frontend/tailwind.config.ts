import type { Config } from 'tailwindcss';

export default {
	content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
	theme: {
		extend: {
			spacing: {
				10.5: '42px',
			},
			colors: {
				background: 'var(--background)',
				foreground: 'var(--foreground)',
			},
		},
	},
	plugins: [],
} satisfies Config;
