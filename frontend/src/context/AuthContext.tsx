// React Context for Authentication

import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { setAccessToken, clearAccessToken } from "../api/client";
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
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate();

	// On mount, try to refresh tokens (restore session)
	useEffect(() => {
		const restoreSession = async () => {
			try {
				const response = await authApi.refresh();
				if (response.success && response.data) {
					setAccessToken(response.data.accessToken);
					setToken(response.data.accessToken);
					// Fetch user info with the new token
					const userInfo = await authApi.getMe();
					if (userInfo.success && userInfo.data) {
						setUser(userInfo.data);
					}
				}
			} catch (error) {
				// No valid refresh token, user needs to login
				console.log("No valid session, user needs to login");
			} finally {
				setIsLoading(false);
			}
		};

		restoreSession();
	}, []);

	const login = async (email: string, password: string) => {
		const response = await authApi.login(email, password);
		if (response.success && response.data) {
			setAccessToken(response.data.accessToken);
			setToken(response.data.accessToken);
			setUser(response.data.user);
			// No localStorage for tokens - security risk
		}
	};

	const logout = async () => {
		try {
			await authApi.logout();
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			clearAccessToken();
			setUser(null);
			setToken(null);
			navigate("/login");
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
