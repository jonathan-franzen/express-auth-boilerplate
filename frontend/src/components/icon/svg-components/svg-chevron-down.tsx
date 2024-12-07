import { ISvgProps } from '@/components/icon/types';

const defaultProps: ISvgProps = {
	viewBox: '0 0 16 16',
};

export function SvgChevronDown(props: ISvgProps) {
	props = { ...defaultProps, ...props };
	const { ...svgProps } = props;

	return (
		<svg {...svgProps}>
			<rect id='Rectangle_1918' data-name='Rectangle 1918' fill='none' />
			<g id='Group_2277' data-name='Group 2277' transform='translate(-499.913 -683.627)'>
				<path
					id='Path_2346'
					data-name='Path 2346'
					d='M9.982,15.031,4.589,9.639,5.1,9.125,9.982,14l4.879-4.879.514.514Z'
					transform='translate(497.93 679.549)'
				/>
			</g>
		</svg>
	);
}
