import { SvgAlert } from '@/components/icon/svg-components/svg-alert';
import { SvgChevronDown } from '@/components/icon/svg-components/svg-chevron-down';
import { SvgCross } from '@/components/icon/svg-components/svg-cross';
import { SvgOptions } from '@/components/icon/svg-components/svg-options';
import { SvgSettings } from '@/components/icon/svg-components/svg-settings';
import { svgIconComponents } from '@/components/icon/types';

export const SvgIconComponents: svgIconComponents = {
	'chevron-down': SvgChevronDown,
	cross: SvgCross,
	settings: SvgSettings,
	options: SvgOptions,
	alert: SvgAlert,
};
