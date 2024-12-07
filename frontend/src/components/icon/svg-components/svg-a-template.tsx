import { ISvgProps } from '@/components/icon/types';

const defaultProps: ISvgProps = {
	viewBox: '0 0 20 20',
};

export function SvgTemplate(props: ISvgProps) {
	props = { ...defaultProps, ...props };
	const { ...svgProps } = props;

	return <svg {...svgProps}>You can copy the svg content here! Add any fill props to defaultProps. No need for width or height!</svg>;
}
