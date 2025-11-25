import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import styles from "./Card.module.css";

interface CardProps {
	children: React.ReactNode;
	className?: string;
	hoverable?: boolean;
	onClick?: () => void;
	padding?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
	children,
	className,
	hoverable = false,
	onClick,
	padding = "md",
}) => {
	const Component = onClick ? motion.div : "div";

	return (
		<Component
			className={clsx(
				styles.card,
				styles[`padding-${padding}`],
				hoverable && styles.hoverable,
				onClick && styles.clickable,
				className
			)}
			onClick={onClick}
			{...(onClick && {
				whileHover: { scale: 1.02, y: -4 },
				whileTap: { scale: 0.98 },
				transition: { duration: 0.2 },
			})}
		>
			{children}
		</Component>
	);
};
