// NewsList component to display list of news articles with filtering and loading states

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { newsApi } from "../../api/news.api";
import { apiClient } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/constants";
import type { News, Category } from "../../types";
import { NewsCard } from "./NewsCard";
import { Button, Skeleton } from "../ui";
import styles from "./NewsList.module.css";

export const NewsList: React.FC = () => {
	const [news, setNews] = useState<News[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<
		number | undefined
	>();
	const [loading, setLoading] = useState(true);
	const { hasRole } = useAuth();
	const navigate = useNavigate();
	const canCreate = hasRole(ROLES.EDITOR) || hasRole(ROLES.ADMIN);

	useEffect(() => {
		loadCategories();
	}, []);

	useEffect(() => {
		loadNews();
	}, [selectedCategory]);

	const loadCategories = async () => {
		try {
			const { data } = await apiClient.get("/categories");
			if (data.success) setCategories(data.data);
		} catch (error) {
			console.error("Ошибка загрузки категорий:", error);
		}
	};

	const loadNews = async () => {
		try {
			setLoading(true);
			const response = await newsApi.getAll(selectedCategory);
			if (response.success) setNews(response.data || []);
		} catch (error) {
			console.error("Ошибка загрузки новостей:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<h1 className={styles.title}>📰 Новости</h1>
					<p className={styles.subtitle}>
						{selectedCategory
							? `Категория: ${
									categories.find((c) => c.id === selectedCategory)?.name
							  }`
							: "Все новости"}
					</p>
				</motion.div>
				{canCreate && (
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
					>
						<Button
							onClick={() => navigate("/news/create")}
							icon={<span>✨</span>}
						>
							Создать новость
						</Button>
					</motion.div>
				)}
			</div>

			<motion.div
				className={styles.filters}
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
			>
				<button
					className={`${styles.filterBtn} ${
						!selectedCategory ? styles.active : ""
					}`}
					onClick={() => setSelectedCategory(undefined)}
				>
					Все
				</button>
				{categories.map((cat) => (
					<button
						key={cat.id}
						className={`${styles.filterBtn} ${
							selectedCategory === cat.id ? styles.active : ""
						}`}
						onClick={() => setSelectedCategory(cat.id)}
					>
						{cat.name}
					</button>
				))}
			</motion.div>

			{loading ? (
				<div className={styles.grid}>
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<div key={i} className={styles.skeletonCard}>
							<Skeleton height={200} />
							<Skeleton height={24} width="80%" />
							<Skeleton height={20} width="60%" />
							<Skeleton height={60} />
						</div>
					))}
				</div>
			) : news.length === 0 ? (
				<motion.div
					className={styles.empty}
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
				>
					<div className={styles.emptyIcon}>📭</div>
					<h3>Новостей пока нет</h3>
					<p>Будьте первым, кто создаст новость в этой категории</p>
					{canCreate && (
						<Button onClick={() => navigate("/news/create")}>
							Создать новость
						</Button>
					)}
				</motion.div>
			) : (
				<motion.div
					className={styles.grid}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
				>
					<AnimatePresence mode="popLayout">
						{news.map((item, index) => (
							<motion.div
								key={item.id}
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ delay: index * 0.05 }}
							>
								<NewsCard news={item} onDelete={loadNews} />
							</motion.div>
						))}
					</AnimatePresence>
				</motion.div>
			)}
		</div>
	);
};
