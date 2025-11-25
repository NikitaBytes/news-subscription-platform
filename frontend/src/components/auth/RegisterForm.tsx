// Register form component

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Button, Input, Card } from "../ui";
import styles from "./AuthForm.module.css";

export const RegisterForm: React.FC = () => {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);
	const { register } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setLoading(true);
		try {
			await register(username, email, password);
			setSuccess("Регистрация успешна! Перенаправление...");
			setTimeout(() => navigate("/login"), 1500);
		} catch (err: any) {
			setError(err.response?.data?.error || "Ошибка регистрации");
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
						✨
					</motion.div>
					<h2 className={styles.title}>Создать аккаунт</h2>
					<p className={styles.subtitle}>Присоединяйтесь к нам</p>
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

						{success && (
							<motion.div
								className={styles.success}
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
							>
								✅ {success}
							</motion.div>
						)}

						<Input
							type="text"
							label="Имя пользователя"
							placeholder="johndoe"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							fullWidth
							icon={<span>👤</span>}
						/>

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
							placeholder="Минимум 8 символов"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							minLength={8}
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
							Зарегистрироваться
						</Button>

						<div className={styles.divider}>
							<span>или</span>
						</div>

						<p className={styles.footer}>
							Уже есть аккаунт?{" "}
							<Link to="/login" className={styles.link}>
								Войти
							</Link>
						</p>
					</form>
				</Card>
			</motion.div>
		</div>
	);
};
