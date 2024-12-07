import { ReactChildrenReactInterface } from '@/interfaces/react/react-children.react.interface';

export default async function Layout({ children }: ReactChildrenReactInterface) {
	return <div>{children}</div>;
}
