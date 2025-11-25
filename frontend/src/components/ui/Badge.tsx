import React from "react";
import clsx from "clsx";
import styles from "./Badge.module.css";

interface BadgeProps {
	children: React.ReactNode;
	variant?: "primary" | "success" | "danger" | "warning" | "secondary";
	size?: "sm" | "md";
	className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
	children,
	variant = "primary",
	size = "md",
	className,
}) => {
	return (
		<span
			className={clsx(styles.badge, styles[variant], styles[size], className)}
		>
			{children}
		</span>
	);
};
