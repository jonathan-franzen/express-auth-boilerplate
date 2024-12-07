import { DetailedHTMLProps, HTMLAttributes, SVGProps } from 'react';

export type IconSize = '8' | '10' | '12' | '14' | '16' | '18' | '20' | '22' | '24' | '26' | '28' | '32' | '34' | '36' | '40';
export interface IIconProps extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
	/**
	 * @deprecated
	 */
	icon?: string;
	name?: string;
	svgProps?: ISvgProps;
	iconFocusable?: boolean;
	iconAriaHidden?: boolean;
	size?: IconSize;
	testId?: string;
}

export interface ISvgProps extends SVGProps<SVGSVGElement> {
	pathClassName?: string;
	viewBox?: string;
	currentColor?: string;
}

export type svgIconComponents = {
	[key: string]: (props: ISvgProps) => JSX.Element;
};
