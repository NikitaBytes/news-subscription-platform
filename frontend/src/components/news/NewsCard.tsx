// NewsCard component

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/constants";
import { newsApi } from "../../api/news.api";
import { Card, Badge } from "../ui";
import type { News } from "../../types";
import styles from "./NewsCard.module.css";

interface NewsCardProps {
	news: News;
	onDelete?: () => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news, onDelete }) => {
	const { hasRole } = useAuth();
	const navigate = useNavigate();
	const canEdit = hasRole(ROLES.EDITOR) || hasRole(ROLES.ADMIN);

	const handleDelete = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!window.confirm(`Удалить новость "${news.title}"?`)) {
			return;
		}
		try {
			const response = await newsApi.delete(news.id);
			if (response.success) {
				onDelete?.();
			} else {
				alert("Ошибка удаления новости");
			}
		} catch (err) {
			alert("Ошибка удаления новости");
		}
	};

	const handleEdit = (e: React.MouseEvent) => {
		e.stopPropagation();
		navigate(`/news/edit/${news.id}`);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			whileHover={{ y: -4 }}
		>
			<Card
				hoverable
				onClick={() => navigate(`/news/${news.id}`)}
				className={styles.card}
			>
				<div className={styles.header}>
					<Badge variant="primary" size="sm">
						{news.category.name}
					</Badge>
					{canEdit && (
						<div className={styles.actions}>
							<motion.button
								onClick={handleEdit}
								className={styles.editBtn}
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.95 }}
								title="Редактировать"
							>
								✏️
							</motion.button>
							<motion.button
								onClick={handleDelete}
								className={styles.deleteBtn}
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.95 }}
								title="Удалить"
							>
								🗑️
							</motion.button>
						</div>
					)}
				</div>

				<h3 className={styles.title}>{news.title}</h3>

				<p className={styles.excerpt}>
					{news.content.length > 150
						? `${news.content.substring(0, 150)}...`
						: news.content}
				</p>

				<div className={styles.footer}>
					<div className={styles.author}>
						<div className={styles.avatar}>
							{news.author.username[0].toUpperCase()}
						</div>
						<div className={styles.authorInfo}>
							<span className={styles.authorName}>{news.author.username}</span>
							<span className={styles.date}>
								{new Date(news.createdAt).toLocaleDateString("ru-RU", {
									day: "numeric",
									month: "short",
									year: "numeric",
								})}
							</span>
						</div>
					</div>
					<div className={styles.readMore}>Читать →</div>
				</div>
			</Card>
		</motion.div>
	);
};
