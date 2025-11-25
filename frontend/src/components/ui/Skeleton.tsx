import React from "react";
import clsx from "clsx";
import styles from "./Skeleton.module.css";

interface SkeletonProps {
	width?: string | number;
	height?: string | number;
	circle?: boolean;
	className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
	width,
	height = 20,
	circle = false,
	className,
}) => {
	return (
		<div
			className={clsx(styles.skeleton, circle && styles.circle, className)}
			style={{
				width: typeof width === "number" ? `${width}px` : width,
				height: typeof height === "number" ? `${height}px` : height,
			}}
		/>
	);
};
