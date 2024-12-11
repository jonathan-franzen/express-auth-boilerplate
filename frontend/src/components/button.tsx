import ButtonPropsReactInterface from '@/interfaces/react/button-props.react.interface';
import { ReactElement } from 'react';
import { twMerge } from 'tailwind-merge';

export default function Button({ label, type = 'button', isLoading = false, disabled = false, onClick, className }: ButtonPropsReactInterface): ReactElement {
	return (
		<button
			type={type}
			disabled={isLoading || disabled}
			onClick={onClick}
			className={twMerge(
				'inline-flex min-h-10.5 w-full items-center justify-center gap-2 rounded-md bg-gray-700 px-3 text-center text-xs font-semibold text-white shadow-inner',
				'focus:outline-none disabled:cursor-not-allowed data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1',
				className,
			)}
		>
			{isLoading ? 'Loading...' : label}
		</button>
	);
}
