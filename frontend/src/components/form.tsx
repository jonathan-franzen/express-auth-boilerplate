'use client';

import Button from '@/components/button';
import FormPropsReactInterface from '@/interfaces/react/props/form.props.react.interface';
import clsx from 'clsx';
import NextForm from 'next/form';
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
		<NextForm action='/login' onSubmit={handleOnSubmit} className='mt-8 flex w-full flex-col'>
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
							'mt-1.5 block w-full rounded-lg border-none bg-neutral-100 px-3 py-3 text-xs opacity-80',
							'focus:outline-none data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-gray-400',
						)}
					/>
				</div>
			))}
			{additionalContent && <div className='mt-2'>{additionalContent}</div>}
			<Button label={submitLabel} type='submit' isLoading={isLoading} className='mt-6' />
			{errorMessage && (
				<div className='mt-2 flex items-center gap-3 rounded-md bg-pink-50 p-2'>
					<div className='text-2xs text-pink-900'>{errorMessage}</div>
				</div>
			)}
		</NextForm>
	);
}
