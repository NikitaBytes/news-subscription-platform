// ProtectedRoute component to guard routes based on authentication and roles

import React from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/constants";
import { ForbiddenPage } from "../../pages/ForbiddenPage";

interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredRole?: string;
}

// Check access rights considering role hierarchy
const hasAccess = (
	userRoles: string[] | undefined,
	requiredRole: string
): boolean => {
	if (!userRoles || userRoles.length === 0) return false;

	// ADMIN имеет доступ ко всему
	if (userRoles.includes(ROLES.ADMIN)) return true;

	// EDITOR имеет доступ к функциям SUBSCRIBER
	if (requiredRole === ROLES.SUBSCRIBER && userRoles.includes(ROLES.EDITOR)) {
		return true;
	}

	// Прямая проверка роли
	return userRoles.includes(requiredRole);
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	children,
	requiredRole,
}) => {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "60vh",
				}}
			>
				<motion.div
					animate={{ rotate: 360 }}
					transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
					style={{
						width: 40,
						height: 40,
						border: "3px solid var(--color-border)",
						borderTopColor: "var(--color-primary)",
						borderRadius: "50%",
					}}
				/>
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	if (requiredRole && !hasAccess(user.roles, requiredRole)) {
		return <ForbiddenPage />;
	}

	return <>{children}</>;
};
