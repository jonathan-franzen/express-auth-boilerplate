import { SvgIconComponents } from '@/components/icon/svg-components';
import { IconSize, IIconProps } from '@/components/icon/types';

const Icon = (props: IIconProps) => {
	const { size, icon, name, className, testId } = props;

	const resolveSvgByType = (type: string) => {
		type = type.toLowerCase();
		if (!SvgIconComponents[type]) {
			return null;
		}

		return SvgIconComponents[type];
	};

	const iconName = () => {
		if (name) return name;
		if (icon) return icon;

		return '';
	};

	const SvgIcon = resolveSvgByType(iconName());
	return (
		<i title={props.title} role={props.role} className={`${className} h-fit w-fit leading-[0]`} data-testid={testId}>
			{SvgIcon ? <SvgIcon width={size} height={size} aria-hidden={true} focusable={false} {...props.svgProps} /> : ''}
		</i>
	);
};

Icon.defaultProps = {
	size: '24' as IconSize,
	role: 'img',
};

export default Icon;
