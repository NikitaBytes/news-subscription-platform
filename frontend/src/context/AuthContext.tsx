// React Context for Authentication

import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import {
	setUnauthorizedCallback,
	setErrorNavigationCallback,
} from "../api/client";
import type { User } from "../types";

interface AuthContextType {
	user: (User & { roles: string[] }) | null;
	token: string | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	register: (
		username: string,
		email: string,
		password: string
	) => Promise<void>;
	isLoading: boolean;
	hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<(User & { roles: string[] }) | null>(null);
	const [token, setToken] = useState<string | null>(
		localStorage.getItem("token")
	);
	const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate();

	// Устанавливаем callback для обработки 401 ошибок
	useEffect(() => {
		setUnauthorizedCallback(() => {
			navigate("/login");
		});

		// Устанавливаем callback для обработки других HTTP ошибок
		setErrorNavigationCallback((status: number) => {
			if (status === 403) {
				navigate("/403");
			} else if (status === 404) {
				// Для 404 не редиректим, чтобы роутер сам показал NotFoundPage
				// Или можем редиректить если нужно
				// navigate("/404");
			} else if (status >= 500) {
				// Для 500+ ошибок не редиректим - ErrorBoundary покажет ServerErrorPage
				// Или можем показать отдельную страницу если нужно
				// navigate("/500");
			}
		});
	}, [navigate]);

	useEffect(() => {
		const storedUser = localStorage.getItem("user");
		if (storedUser && token) {
			setUser(JSON.parse(storedUser));
		}
		setIsLoading(false);
	}, [token]);

	const login = async (email: string, password: string) => {
		const response = await authApi.login(email, password);
		if (response.success && response.data) {
			setToken(response.data.token);
			setUser(response.data.user);
			localStorage.setItem("token", response.data.token);
			localStorage.setItem("user", JSON.stringify(response.data.user));
		}
	};

	const logout = async () => {
		try {
			await authApi.logout();
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			setUser(null);
			setToken(null);
			localStorage.removeItem("token");
			localStorage.removeItem("user");
		}
	};

	const register = async (
		username: string,
		email: string,
		password: string
	) => {
		await authApi.register(username, email, password);
	};

	const hasRole = (role: string): boolean => {
		if (!user?.roles || user.roles.length === 0) return false;

		// ADMIN имеет все роли
		if (user.roles.includes("ROLE_ADMIN")) return true;

		// EDITOR имеет права SUBSCRIBER
		if (role === "ROLE_SUBSCRIBER" && user.roles.includes("ROLE_EDITOR")) {
			return true;
		}

		return user.roles.includes(role);
	};

	return (
		<AuthContext.Provider
			value={{ user, token, login, logout, register, isLoading, hasRole }}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth должен использоваться внутри AuthProvider");
	}
	return context;
};
