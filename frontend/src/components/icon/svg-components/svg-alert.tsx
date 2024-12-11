import { ISvgProps } from '@/components/icon/types';

const defaultProps: ISvgProps = {
	viewBox: '0 0 20 20',
	fill: 'none',
};

export function SvgAlert(props: ISvgProps) {
	props = { ...defaultProps, ...props };
	const { ...svgProps } = props;

	return (
		<svg {...svgProps}>
			<path
				d='M8.75 15.02C8.75 14.6817 8.86667 14.3958 9.1 14.1625C9.345 13.9175 9.63667 13.795 9.975 13.795C10.3133 13.795 10.5992 13.9175 10.8325 14.1625C11.0775 14.3958 11.2 14.6817 11.2 15.02C11.2 15.3583 11.0775 15.65 10.8325 15.895C10.5992 16.1283 10.3133 16.245 9.975 16.245C9.63667 16.245 9.345 16.1283 9.1 15.895C8.86667 15.65 8.75 15.3583 8.75 15.02ZM10.675 3.75V12.745H9.275V3.75H10.675Z'
				fill='rgb(131 24 67)'
			/>
			<path
				fillRule='evenodd'
				clipRule='evenodd'
				d='M10 18.5C14.6944 18.5 18.5 14.6944 18.5 10C18.5 5.30558 14.6944 1.5 10 1.5C5.30558 1.5 1.5 5.30558 1.5 10C1.5 14.6944 5.30558 18.5 10 18.5ZM10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20Z'
				fill='rgb(131 24 67)'
			/>
		</svg>
	);
}