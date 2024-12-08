import { ISvgProps } from '@/components/icon/types';

const defaultProps: ISvgProps = {
	viewBox: '0 0 20 20',
	fill: 'none',
};

export function SvgCross(props: ISvgProps) {
	props = { ...defaultProps, ...props };
	const { ...svgProps } = props;

	return (
		<svg {...svgProps}>
			<path
				fillRule='evenodd'
				clipRule='evenodd'
				d='M0.462463 17.3045C-0.154154 17.9211 -0.154154 18.9209 0.462463 19.5375C1.07908 20.1541 2.07881 20.1541 2.69543 19.5375L10 12.2329L17.3046 19.5375C17.9212 20.1541 18.9209 20.1541 19.5375 19.5375C20.1542 18.9209 20.1542 17.9211 19.5375 17.3045L12.233 9.99997L19.5375 2.69542C20.1542 2.07881 20.1542 1.07908 19.5375 0.462461C18.9209 -0.154155 17.9212 -0.154155 17.3046 0.462461L10 7.76701L2.69543 0.462463C2.07881 -0.154152 1.07908 -0.154152 0.462463 0.462463C-0.154154 1.07908 -0.154154 2.07881 0.462463 2.69542L7.76703 9.99997L0.462463 17.3045Z'
				fill='#333333'
			/>
		</svg>
	);
}
