import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import styles from "./Input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	icon?: React.ReactNode;
	fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, icon, fullWidth, className, ...props }, ref) => {
		const [isFocused, setIsFocused] = React.useState(false);

		return (
			<div className={clsx(styles.wrapper, fullWidth && styles.fullWidth)}>
				{label && (
					<label className={styles.label}>
						{label}
						{props.required && <span className={styles.required}>*</span>}
					</label>
				)}
				<div
					className={clsx(
						styles.inputWrapper,
						isFocused && styles.focused,
						error && styles.error,
						props.disabled && styles.disabled
					)}
				>
					{icon && <span className={styles.icon}>{icon}</span>}
					<input
						ref={ref}
						className={clsx(styles.input, className)}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						{...props}
					/>
				</div>
				{error && (
					<motion.p
						className={styles.errorMessage}
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.2 }}
					>
						{error}
					</motion.p>
				)}
			</div>
		);
	}
);

Input.displayName = "Input";
