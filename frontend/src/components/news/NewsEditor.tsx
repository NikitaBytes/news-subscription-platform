// NewsEditor component for creating and editing news articles

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { newsApi } from "../../api/news.api";
import { apiClient } from "../../api/client";
import { Button, Card, Input, Skeleton } from "../ui";
import type { Category } from "../../types";
import styles from "./NewsEditor.module.css";

export const NewsEditor: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [categoryId, setCategoryId] = useState<number>(0);
	const [categories, setCategories] = useState<Category[]>([]);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		loadCategories();
		if (id) loadNews();
	}, [id]);

	const loadCategories = async () => {
		try {
			const { data } = await apiClient.get("/categories");
			if (data.success) setCategories(data.data);
		} catch (error) {
			console.error(error);
			setError("Не удалось загрузить категории");
		}
	};

	const loadNews = async () => {
		setLoading(true);
		try {
			const response = await newsApi.getById(Number(id));
			if (response.success && response.data) {
				setTitle(response.data.title);
				setContent(response.data.content);
				setCategoryId(response.data.categoryId);
			}
		} catch (error: any) {
			setError(error.response?.data?.error || "Не удалось загрузить новость");
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSubmitting(true);
		try {
			if (id) {
				await newsApi.update(Number(id), { title, content, categoryId });
			} else {
				await newsApi.create({ title, content, categoryId });
			}
			navigate("/news");
		} catch (err: any) {
			setError(err.response?.data?.error || "Ошибка сохранения новости");
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className={styles.container}>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className={styles.loadingContainer}
				>
					<Skeleton width={100} height={40} />
					<Card>
						<Skeleton height={24} />
						<Skeleton height={56} />
						<Skeleton height={56} />
						<Skeleton height={200} />
						<Skeleton height={48} width={150} />
					</Card>
				</motion.div>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<div className={styles.topBar}>
					<Button variant="ghost" onClick={() => navigate("/news")}>
						← Назад к новостям
					</Button>
				</div>

				<h1 className={styles.title}>
					{id ? "Редактировать новость" : "Создать новость"}
				</h1>

				{error && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						className={styles.error}
					>
						❌ {error}
					</motion.div>
				)}

				<Card>
					<form onSubmit={handleSubmit} className={styles.form}>
						<div className={styles.formGroup}>
							<label htmlFor="title" className={styles.label}>
								Заголовок
							</label>
							<Input
								id="title"
								type="text"
								placeholder="Введите заголовок новости"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								required
							/>
						</div>

						<div className={styles.formGroup}>
							<label htmlFor="category" className={styles.label}>
								Категория
							</label>
							<select
								id="category"
								value={categoryId}
								onChange={(e) => setCategoryId(Number(e.target.value))}
								required
								className={styles.select}
							>
								<option value={0} disabled>
									Выберите категорию
								</option>
								{categories.map((cat) => (
									<option key={cat.id} value={cat.id}>
										{cat.name}
									</option>
								))}
							</select>
						</div>

						<div className={styles.formGroup}>
							<label htmlFor="content" className={styles.label}>
								Содержание
							</label>
							<textarea
								id="content"
								placeholder="Введите текст новости"
								value={content}
								onChange={(e) => setContent(e.target.value)}
								required
								rows={12}
								className={styles.textarea}
							/>
						</div>

						<div className={styles.actions}>
							<Button
								type="button"
								variant="outline"
								onClick={() => navigate("/news")}
								disabled={submitting}
							>
								Отмена
							</Button>
							<Button
								type="submit"
								variant="primary"
								loading={submitting}
								disabled={submitting}
							>
								{id ? "Сохранить изменения" : "Создать новость"}
							</Button>
						</div>
					</form>
				</Card>
			</motion.div>
		</div>
	);
};
