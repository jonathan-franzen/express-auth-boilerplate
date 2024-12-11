import FormFieldReactInterface from '@/interfaces/react/form-field.react.interface';
import { ReactElement } from 'react';

export default interface FormPropsReactInterface {
	fields: FormFieldReactInterface[];
	submitLabel: string;
	onSubmit: (formData: Record<string, string>) => Promise<void>;
	isLoading?: boolean;
	additionalContent?: ReactElement;
}
