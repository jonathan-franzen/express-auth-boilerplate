import { ButtonPropsReactInterface } from '@/interfaces/react/button-props.react.interface';
import { ReactElement } from 'react';
import { twMerge } from 'tailwind-merge';

export default function Button({ label, type = 'button', isLoading = false, disabled = false, onClick, className }: ButtonPropsReactInterface): ReactElement {
	return (
		<button
			type={type}
			disabled={isLoading || disabled}
			onClick={onClick}
			className={twMerge(
				'min-h-10.5 text-center justify-center inline-flex items-center gap-2 w-full rounded-md bg-gray-700 px-3 text-xs font-semibold text-white shadow-inner',
				'disabled:cursor-not-allowed data-[hover]:bg-gray-600 data-[open]:bg-gray-700 focus:outline-none data-[focus]:outline-1',
				className,
			)}
		>
			{isLoading ? 'Loading...' : label}
		</button>
	);
}
