// Компонент управления подписками

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { subscriptionsApi } from "../../api/subscriptions.api";
import { apiClient } from "../../api/client";
import type { Category } from "../../types";
import { Button, Card, Skeleton } from "../ui";
import styles from "./SubscriptionsManager.module.css";

interface Subscription {
	id: number;
	category: Category & { _count: { news: number } };
	createdAt: string;
}

interface Message {
	type: "success" | "error";
	text: string;
}

export const SubscriptionsManager: React.FC = () => {
	const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState<Message | null>(null);
	const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			setLoading(true);
			const [subsResponse, catsResponse] = await Promise.all([
				subscriptionsApi.getMy(),
				apiClient.get("/categories"),
			]);

			if (subsResponse.success) setSubscriptions(subsResponse.data || []);
			if (catsResponse.data.success)
				setCategories(catsResponse.data.data || []);
		} catch (error) {
			console.error("Ошибка загрузки:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSubscribe = async (categoryId: number) => {
		setProcessingIds((prev) => new Set(prev).add(categoryId));
		try {
			const response = await subscriptionsApi.subscribe(categoryId);
			if (response.success) {
				setMessage({ type: "success", text: "✅ Подписка оформлена!" });
				await loadData();
				setTimeout(() => setMessage(null), 3000);
			}
		} catch (error: any) {
			const errorMsg = error.response?.data?.error || "Ошибка при подписке";
			setMessage({ type: "error", text: `❌ ${errorMsg}` });
			setTimeout(() => setMessage(null), 5000);
		} finally {
			setProcessingIds((prev) => {
				const newSet = new Set(prev);
				newSet.delete(categoryId);
				return newSet;
			});
		}
	};

	const handleUnsubscribe = async (categoryId: number) => {
		setProcessingIds((prev) => new Set(prev).add(categoryId));
		try {
			const response = await subscriptionsApi.unsubscribe(categoryId);
			if (response.success) {
				setMessage({ type: "success", text: "✅ Подписка отменена" });
				await loadData();
				setTimeout(() => setMessage(null), 3000);
			}
		} catch (error: any) {
			const errorMsg = error.response?.data?.error || "Ошибка при отписке";
			setMessage({ type: "error", text: `❌ ${errorMsg}` });
			setTimeout(() => setMessage(null), 5000);
		} finally {
			setProcessingIds((prev) => {
				const newSet = new Set(prev);
				newSet.delete(categoryId);
				return newSet;
			});
		}
	};

	const subscribedIds = new Set(subscriptions.map((s) => s.category.id));

	if (loading) {
		return (
			<div className={styles.container}>
				<div className={styles.header}>
					<Skeleton width={300} height={40} />
					<Skeleton width={200} height={20} />
				</div>
				<div className={styles.grid}>
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className={styles.skeletonCard}>
							<Skeleton height={120} />
							<Skeleton height={24} width="80%" />
							<Skeleton height={40} />
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<motion.div
				className={styles.header}
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
			>
				<div>
					<h1 className={styles.title}>🔔 Подписки</h1>
					<p className={styles.subtitle}>Управляйте категориями новостей</p>
				</div>
			</motion.div>

			<AnimatePresence>
				{message && (
					<motion.div
						className={`${styles.message} ${styles[message.type]}`}
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
					>
						{message.text}
					</motion.div>
				)}
			</AnimatePresence>

			<motion.div
				className={styles.section}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.1 }}
			>
				<h2 className={styles.sectionTitle}>
					💙 Мои подписки ({subscriptions.length})
				</h2>
				{subscriptions.length === 0 ? (
					<motion.div
						className={styles.empty}
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
					>
						<div className={styles.emptyIcon}>📭</div>
						<p>У вас пока нет активных подписок</p>
					</motion.div>
				) : (
					<div className={styles.grid}>
						{subscriptions.map((sub, index) => (
							<motion.div
								key={sub.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
							>
								<Card hoverable>
									<div className={styles.cardHeader}>
										<div className={styles.heartIcon}>💙</div>
										<h3 className={styles.cardTitle}>{sub.category.name}</h3>
									</div>
									<p className={styles.cardDescription}>
										{sub.category.description}
									</p>
									<div className={styles.cardStats}>
										<span>📰 {sub.category._count.news} новостей</span>
										<span className={styles.date}>
											С {new Date(sub.createdAt).toLocaleDateString("ru-RU")}
										</span>
									</div>
									<Button
										variant="danger"
										fullWidth
										onClick={() => handleUnsubscribe(sub.category.id)}
										loading={processingIds.has(sub.category.id)}
										icon={<span>💔</span>}
									>
										Отписаться
									</Button>
								</Card>
							</motion.div>
						))}
					</div>
				)}
			</motion.div>

			<motion.div
				className={styles.section}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.2 }}
			>
				<h2 className={styles.sectionTitle}>✨ Доступные категории</h2>
				{categories.filter((cat) => !subscribedIds.has(cat.id)).length === 0 ? (
					<motion.div
						className={styles.empty}
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
					>
						<div className={styles.emptyIcon}>🎉</div>
						<p>Вы подписаны на все доступные категории!</p>
					</motion.div>
				) : (
					<div className={styles.grid}>
						{categories
							.filter((cat) => !subscribedIds.has(cat.id))
							.map((cat, index) => (
								<motion.div
									key={cat.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.05 }}
								>
									<Card hoverable>
										<div className={styles.cardHeader}>
											<div className={styles.heartIconOutline}>🤍</div>
											<h3 className={styles.cardTitle}>{cat.name}</h3>
										</div>
										<p className={styles.cardDescription}>{cat.description}</p>
										<Button
											variant="primary"
											fullWidth
											onClick={() => handleSubscribe(cat.id)}
											loading={processingIds.has(cat.id)}
											icon={<span>💙</span>}
										>
											Подписаться
										</Button>
									</Card>
								</motion.div>
							))}
					</div>
				)}
			</motion.div>
		</div>
	);
};
