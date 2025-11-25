// Home page

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button, Card } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import styles from "./HomePage.module.css";

export const HomePage: React.FC = () => {
	const navigate = useNavigate();
	const { user } = useAuth();

	const features = [
		{
			icon: "📰",
			title: "Актуальные новости",
			description: "Читайте последние новости из разных категорий",
		},
		{
			icon: "🔔",
			title: "Умные подписки",
			description: "Подписывайтесь только на интересующие вас темы",
		},
		{
			icon: "⚡",
			title: "Быстрый доступ",
			description: "Мгновенный доступ к новостям в любое время",
		},
	];

	return (
		<div className={styles.container}>
			<motion.div
				className={styles.hero}
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				<motion.h1
					className={styles.title}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.6 }}
				>
					Добро пожаловать в <span className={styles.highlight}>News App</span>
				</motion.h1>
				<motion.p
					className={styles.subtitle}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3, duration: 0.6 }}
				>
					Подписывайтесь на интересующие категории и будьте в курсе последних
					событий
				</motion.p>
				<motion.div
					className={styles.actions}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4, duration: 0.6 }}
				>
					<Button size="lg" onClick={() => navigate("/news")}>
						Перейти к новостям →
					</Button>
					{!user && (
						<Button
							variant="outline"
							size="lg"
							onClick={() => navigate("/register")}
						>
							Создать аккаунт
						</Button>
					)}
				</motion.div>
			</motion.div>

			<motion.div
				className={styles.features}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.6, duration: 0.6 }}
			>
				{features.map((feature, index) => (
					<motion.div
						key={feature.title}
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
					>
						<Card hoverable className={styles.featureCard}>
							<div className={styles.featureIcon}>{feature.icon}</div>
							<h3 className={styles.featureTitle}>{feature.title}</h3>
							<p className={styles.featureDescription}>{feature.description}</p>
						</Card>
					</motion.div>
				))}
			</motion.div>

			{!user && (
				<motion.div
					className={styles.cta}
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 1, duration: 0.5 }}
				>
					<Card padding="lg" className={styles.ctaCard}>
						<h2 className={styles.ctaTitle}>Начните прямо сейчас</h2>
						<p className={styles.ctaText}>
							Создайте бесплатный аккаунт и получите доступ ко всем функциям
						</p>
						<div className={styles.ctaActions}>
							<Button size="lg" onClick={() => navigate("/register")}>
								Регистрация
							</Button>
							<Button
								variant="ghost"
								size="lg"
								onClick={() => navigate("/login")}
							>
								Уже есть аккаунт?
							</Button>
						</div>
					</Card>
				</motion.div>
			)}
		</div>
	);
};
