import { ISvgProps } from '@/components/icon/types';

const defaultProps: ISvgProps = {
	viewBox: '0 0 20 20',
};

export function SvgOptions(props: ISvgProps) {
	props = { ...defaultProps, ...props };
	const { ...svgProps } = props;

	return (
		<svg {...svgProps}>
			<path d='M4 10C4 11.1 3.1 12 2 12C0.9 12 0 11.1 0 10C0 8.9 0.9 8 2 8C3.1 8 4 8.9 4 10Z' fill='#333333' />
			<path d='M12 10C12 11.1 11.1 12 10 12C8.9 12 8 11.1 8 10C8 8.9 8.9 8 10 8C11.1 8 12 8.9 12 10Z' fill='#333333' />
			<path d='M20 10C20 11.1 19.1 12 18 12C16.9 12 16 11.1 16 10C16 8.9 16.9 8 18 8C19.1 8 20 8.9 20 10Z' fill='#333333' />
		</svg>
	);
}
