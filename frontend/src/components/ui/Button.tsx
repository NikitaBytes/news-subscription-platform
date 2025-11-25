import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import styles from "./Button.module.css";

interface ButtonProps
	extends Omit<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		"onDrag" | "onDragStart" | "onDragEnd"
	> {
	variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
	size?: "sm" | "md" | "lg";
	fullWidth?: boolean;
	loading?: boolean;
	icon?: React.ReactNode;
	children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
	variant = "primary",
	size = "md",
	fullWidth = false,
	loading = false,
	icon,
	children,
	className,
	disabled,
	...props
}) => {
	return (
		<motion.button
			className={clsx(
				styles.button,
				styles[variant],
				styles[size],
				fullWidth && styles.fullWidth,
				loading && styles.loading,
				className
			)}
			disabled={disabled || loading}
			whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
			whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
			transition={{ duration: 0.15 }}
			{...(props as any)}
		>
			{loading && (
				<span className={styles.spinner}>
					<svg viewBox="0 0 24 24" fill="none">
						<circle
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="3"
							strokeLinecap="round"
							strokeDasharray="60"
							strokeDashoffset="60"
						>
							<animateTransform
								attributeName="transform"
								type="rotate"
								from="0 12 12"
								to="360 12 12"
								dur="1s"
								repeatCount="indefinite"
							/>
						</circle>
					</svg>
				</span>
			)}
			{!loading && icon && <span className={styles.icon}>{icon}</span>}
			<span className={styles.text}>{children}</span>
		</motion.button>
	);
};
