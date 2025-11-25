// Header component with role-based navigation links

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/constants";

export const Header: React.FC = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	return (
		<header style={styles.header}>
			<nav style={styles.nav}>
				<Link to="/" style={styles.link}>
					Главная
				</Link>
				<Link to="/news" style={styles.link}>
					Новости
				</Link>
				{user && (
					<>
						<Link to="/subscriptions" style={styles.link}>
							Мои подписки
						</Link>
						{(user.roles?.includes(ROLES.EDITOR) ||
							user.roles?.includes(ROLES.ADMIN)) && (
							<Link to="/news/create" style={styles.link}>
								Создать новость
							</Link>
						)}
						{user.roles?.includes(ROLES.ADMIN) && (
							<Link to="/admin" style={styles.link}>
								Админ
							</Link>
						)}
					</>
				)}
			</nav>
			<div style={styles.user}>
				{user ? (
					<>
						<span>Привет, {user.username}!</span>
						<button onClick={handleLogout} style={styles.button}>
							Выйти
						</button>
					</>
				) : (
					<Link to="/login" style={styles.link}>
						Войти
					</Link>
				)}
			</div>
		</header>
	);
};

const styles = {
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		padding: "1rem 2rem",
		backgroundColor: "#333",
		color: "#fff",
	},
	nav: {
		display: "flex",
		gap: "1rem",
	},
	link: {
		color: "#fff",
		textDecoration: "none",
	},
	user: {
		display: "flex",
		gap: "1rem",
		alignItems: "center",
	},
	button: {
		padding: "0.5rem 1rem",
		cursor: "pointer",
	},
};
