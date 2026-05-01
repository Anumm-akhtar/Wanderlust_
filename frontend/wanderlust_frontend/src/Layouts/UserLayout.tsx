import type { ReactNode } from 'react';

type UserLayoutProps = {
	children?: ReactNode;
};

const UserLayout = ({ children }: UserLayoutProps) => {
	return (
		<div className="user-layout">
			<main>{children}</main>
		</div>
	);
};

export default UserLayout;
