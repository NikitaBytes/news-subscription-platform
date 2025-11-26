// Login form component

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Button, Input, Card } from "../ui";
import styles from "./AuthForm.module.css";

export const LoginForm: React.FC = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			await login(email, password);
			navigate("/");
		} catch (err: any) {
			setError(err.response?.data?.error || "Ошибка входа");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className={styles.wrapper}
			>
				<div className={styles.header}>
					<motion.div
						className={styles.iconWrapper}
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2, type: "spring" }}
					>
						🔐
					</motion.div>
					<h2 className={styles.title}>Вход в систему</h2>
					<p className={styles.subtitle}>Войдите, чтобы продолжить</p>
				</div>

				<Card padding="lg">
					<form onSubmit={handleSubmit} className={styles.form}>
						{error && (
							<motion.div
								className={styles.error}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
							>
								⚠️ {error}
							</motion.div>
						)}

						<Input
							type="email"
							label="Email"
							placeholder="your@email.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							fullWidth
							icon={<span>📧</span>}
						/>

						<Input
							type="password"
							label="Пароль"
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							fullWidth
							icon={<span>🔒</span>}
						/>

						<Button
							type="submit"
							fullWidth
							size="lg"
							loading={loading}
							disabled={loading}
						>
							Войти
						</Button>

						<div className={styles.divider}>
							<span>или</span>
						</div>

						<p className={styles.footer}>
							Нет аккаунта?{" "}
							<Link to="/register" className={styles.link}>
								Зарегистрироваться
							</Link>
						</p>
					</form>
				</Card>

				<motion.div
					className={styles.demo}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.6 }}
				>
					<p className={styles.demoTitle}>🎯 Тестовые аккаунты:</p>
					<div className={styles.demoAccounts}>
						<div className={styles.demoAccount}>
							<strong>Админ:</strong> admin@example.com / admin123
						</div>
					</div>
				</motion.div>
			</motion.div>
		</div>
	);
};
