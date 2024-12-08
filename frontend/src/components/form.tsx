'use client';

import Button from '@/components/button';
import { FormPropsReactInterface } from '@/interfaces/react/form-props.react.interface';
import clsx from 'clsx';
import { ChangeEvent, FormEvent, ReactElement, useState } from 'react';

export default function Form({ fields, submitLabel, onSubmit, isLoading = false, additionalContent }: FormPropsReactInterface): ReactElement {
	const [formData, setFormData] = useState<Record<string, string>>({});
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleOnSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrorMessage(null);

		try {
			await onSubmit(formData);
		} catch (error: any) {
			setErrorMessage(error.message || 'Something went wrong.');
		}
	};

	return (
		<form onSubmit={handleOnSubmit} className='w-full flex flex-col mt-8'>
			{fields.map((field) => (
				<div key={field.name} className='mt-2'>
					<input
						id={field.name}
						name={field.name}
						type={field.type}
						placeholder={field.placeholder}
						autoComplete={field.autoComplete}
						required={field.required}
						value={formData[field.name] || ''}
						onChange={handleOnChange}
						className={clsx(
							'mt-1.5 block w-full opacity-80 rounded-lg border-none bg-neutral-100 py-3 px-3 text-xs',
							'focus:outline-none data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-gray-400',
						)}
					/>
				</div>
			))}
			{additionalContent && <div className='mt-2'>{additionalContent}</div>}
			<Button label={submitLabel} type='submit' isLoading={isLoading} className='mt-6' />
			{errorMessage && (
				<div className='bg-pink-50 p-2 mt-2 flex items-center gap-3 rounded-md'>
					<div className='text-2xs text-pink-900'>{errorMessage}</div>
				</div>
			)}
		</form>
	);
}
