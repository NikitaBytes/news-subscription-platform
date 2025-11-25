// News detail view page

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { newsApi } from "../api/news.api";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../utils/constants";
import { Button, Card, Badge, Skeleton } from "../components/ui";
import type { News } from "../types";
import styles from "./NewsDetailPage.module.css";

export const NewsDetailPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { hasRole } = useAuth();
	const [news, setNews] = useState<News | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		loadNews();
	}, [id]);

	const loadNews = async () => {
		if (!id) return;
		try {
			setLoading(true);
			const response = await newsApi.getById(Number(id));
			if (response.success && response.data) {
				setNews(response.data);
			} else {
				setError("Новость не найдена");
			}
		} catch (err) {
			setError("Ошибка загрузки новости");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!id || !window.confirm("Вы уверены, что хотите удалить эту новость?")) {
			return;
		}
		try {
			setDeleting(true);
			const response = await newsApi.delete(Number(id));
			if (response.success) {
				navigate("/news");
			} else {
				alert("Ошибка удаления новости");
			}
		} catch (err) {
			alert("Ошибка удаления новости");
		} finally {
			setDeleting(false);
		}
	};

	const canEdit = hasRole(ROLES.EDITOR) || hasRole(ROLES.ADMIN);

	if (loading) {
		return (
			<div className={styles.container}>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className={styles.skeleton}
				>
					<Skeleton width={100} height={40} />
					<div className={styles.skeletonHeader}>
						<Skeleton width={120} height={24} />
						<Skeleton width={150} height={20} />
					</div>
					<Skeleton height={48} />
					<Skeleton height={20} width="60%" />
					<Skeleton height={200} />
					<Skeleton height={100} />
				</motion.div>
			</div>
		);
	}

	if (error || !news) {
		return (
			<div className={styles.container}>
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					className={styles.error}
				>
					<div className={styles.errorIcon}>😕</div>
					<h2>{error || "Новость не найдена"}</h2>
					<p>Возможно, новость была удалена или перемещена</p>
					<Button onClick={() => navigate("/news")} icon={<span>←</span>}>
						Вернуться к новостям
					</Button>
				</motion.div>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className={styles.topBar}
			>
				<Button
					variant="ghost"
					onClick={() => navigate("/news")}
					icon={<span>←</span>}
				>
					Назад
				</Button>
				{canEdit && (
					<div className={styles.actions}>
						<Button
							variant="outline"
							size="sm"
							onClick={() => navigate(`/news/edit/${id}`)}
							icon={<span>✏️</span>}
						>
							Редактировать
						</Button>
						<Button
							variant="danger"
							size="sm"
							onClick={handleDelete}
							loading={deleting}
							icon={<span>🗑️</span>}
						>
							Удалить
						</Button>
					</div>
				)}
			</motion.div>

			<motion.article
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
			>
				<Card>
					<div className={styles.header}>
						<Badge variant="primary">{news.category?.name}</Badge>
						<span className={styles.date}>
							{new Date(news.createdAt).toLocaleDateString("ru-RU", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</span>
					</div>
					<h1 className={styles.title}>{news.title}</h1>
					<div className={styles.authorSection}>
						<div className={styles.avatar}>
							{news.author?.username?.[0]?.toUpperCase() || "?"}
						</div>
						<div className={styles.authorInfo}>
							<div className={styles.authorName}>
								{news.author?.username || "Неизвестен"}
							</div>
							<div className={styles.authorMeta}>Автор статьи</div>
						</div>
					</div>
					<div className={styles.content}>{news.content}</div>{" "}
					{news.updatedAt && news.updatedAt !== news.createdAt && (
						<div className={styles.updated}>
							<span>✏️</span> Обновлено:{" "}
							{new Date(news.updatedAt).toLocaleDateString("ru-RU", {
								year: "numeric",
								month: "long",
								day: "numeric",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</div>
					)}
				</Card>
			</motion.article>
		</div>
	);
};
