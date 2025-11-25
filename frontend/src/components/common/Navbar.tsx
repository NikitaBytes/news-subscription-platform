import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui";
import styles from "./Navbar.module.css";

export const Navbar: React.FC = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [isScrolled, setIsScrolled] = React.useState(false);

	React.useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	return (
		<motion.nav
			className={clsx(styles.navbar, isScrolled && styles.scrolled)}
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			transition={{ duration: 0.3 }}
		>
			<div className={styles.container}>
				<Link to="/" className={styles.logo}>
					<motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
						News App
					</motion.span>
				</Link>

				<div className={styles.nav}>
					<Link to="/news" className={styles.navLink}>
						Новости
					</Link>
					{user && (
						<>
							<Link to="/subscriptions" className={styles.navLink}>
								Подписки
							</Link>
							{user.roles?.includes("ROLE_ADMIN") && (
								<Link to="/admin" className={styles.navLink}>
									Админ
								</Link>
							)}
						</>
					)}
				</div>

				<div className={styles.actions}>
					{user ? (
						<div className={styles.userMenu}>
							<div className={styles.userInfo}>
								<div className={styles.avatar}>
									{user.username?.[0]?.toUpperCase() || "U"}
								</div>
								<span className={styles.username}>{user.username}</span>
							</div>
							<Button variant="ghost" size="sm" onClick={handleLogout}>
								Выйти
							</Button>
						</div>
					) : (
						<div className={styles.authButtons}>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => navigate("/login")}
							>
								Войти
							</Button>
							<Button size="sm" onClick={() => navigate("/register")}>
								Регистрация
							</Button>
						</div>
					)}
				</div>
			</div>
		</motion.nav>
	);
};
