// Admin page

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui";
import { LogsViewer } from "../components/admin/LogsViewer";
import styles from "./AdminPage.module.css";

interface User {
	id: number;
	username: string;
	email: string;
	isActive: boolean;
	roles: Array<{ role: { id: number; name: string } }>;
}

interface Message {
	type: "success" | "error";
	text: string;
}

export const AdminPage: React.FC = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [activeTab, setActiveTab] = useState<
		"users" | "actions" | "http" | "app"
	>("users");
	const [editingUserId, setEditingUserId] = useState<number | null>(null);
	const [selectedRoleId, setSelectedRoleId] = useState<number>(3);
	const [message, setMessage] = useState<Message | null>(null);
	const [processing, setProcessing] = useState<number | null>(null);
	const { user: currentUser } = useAuth();

	useEffect(() => {
		loadUsers();
	}, []);

	const loadUsers = async () => {
		try {
			const { data } = await apiClient.get("/users");
			if (data.success) setUsers(data.data);
		} catch (error) {
			console.error("Ошибка загрузки пользователей:", error);
		}
	};

	const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
		if (userId === currentUser?.id && !currentStatus) {
			setMessage({
				type: "error",
				text: "❌ Вы не можете деактивировать свой собственный аккаунт",
			});
			setTimeout(() => setMessage(null), 5000);
			return;
		}

		setProcessing(userId);
		try {
			const response = await apiClient.put(`/users/${userId}/status`, {
				isActive: !currentStatus,
			});
			if (response.data.success) {
				setMessage({
					type: "success",
					text: `✅ Пользователь ${
						!currentStatus ? "активирован" : "деактивирован"
					}`,
				});
				await loadUsers();
				setTimeout(() => setMessage(null), 3000);
			}
		} catch (error: any) {
			const errorMsg =
				error.response?.data?.error || "Ошибка изменения статуса";
			setMessage({ type: "error", text: `❌ ${errorMsg}` });
			setTimeout(() => setMessage(null), 5000);
		} finally {
			setProcessing(null);
		}
	};

	const handleAddRole = async (userId: number) => {
		setProcessing(userId);
		try {
			const response = await apiClient.put(`/users/${userId}/role`, {
				roleId: selectedRoleId,
			});
			if (response.data.success) {
				setEditingUserId(null);
				setMessage({ type: "success", text: "✅ Роль успешно добавлена" });
				await loadUsers();
				setTimeout(() => setMessage(null), 3000);
			}
		} catch (error: any) {
			const errorMsg = error.response?.data?.error || "Ошибка добавления роли";
			setMessage({ type: "error", text: `❌ ${errorMsg}` });
			setTimeout(() => setMessage(null), 5000);
		} finally {
			setProcessing(null);
		}
	};

	const handleRemoveRole = async (userId: number, roleId: number) => {
		if (userId === currentUser?.id && roleId === 1) {
			setMessage({
				type: "error",
				text: "❌ Вы не можете удалить свою роль администратора",
			});
			setTimeout(() => setMessage(null), 5000);
			return;
		}

		setProcessing(userId);
		try {
			const response = await apiClient.delete(
				`/users/${userId}/role/${roleId}`
			);
			if (response.data.success) {
				setMessage({ type: "success", text: "✅ Роль успешно удалена" });
				await loadUsers();
				setTimeout(() => setMessage(null), 3000);
			}
		} catch (error: any) {
			const errorMsg = error.response?.data?.error || "Ошибка удаления роли";
			setMessage({ type: "error", text: `❌ ${errorMsg}` });
			setTimeout(() => setMessage(null), 5000);
		} finally {
			setProcessing(null);
		}
	};

	const getRoleColor = (roleName: string): string => {
		if (roleName.includes("ADMIN")) return "admin";
		if (roleName.includes("EDITOR")) return "editor";
		return "subscriber";
	};

	const getRoleShortName = (roleName: string): string => {
		return roleName.replace("ROLE_", "");
	};

	return (
		<div className={styles.container}>
			<motion.div
				className={styles.header}
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
			>
				<h1 className={styles.title}>⚙️ Панель администратора</h1>
				<p className={styles.subtitle}>
					Управление пользователями и мониторинг системы
				</p>
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

			<div className={styles.tabs}>
				<button
					onClick={() => setActiveTab("users")}
					className={`${styles.tab} ${
						activeTab === "users" ? styles.active : ""
					}`}
				>
					👥 Пользователи
				</button>
				<button
					onClick={() => setActiveTab("actions")}
					className={`${styles.tab} ${
						activeTab === "actions" ? styles.active : ""
					}`}
				>
					📝 Действия пользователей
				</button>
				<button
					onClick={() => setActiveTab("http")}
					className={`${styles.tab} ${
						activeTab === "http" ? styles.active : ""
					}`}
				>
					🔴 HTTP Ошибки
				</button>
				<button
					onClick={() => setActiveTab("app")}
					className={`${styles.tab} ${
						activeTab === "app" ? styles.active : ""
					}`}
				>
					⚠️ Ошибки приложения
				</button>
			</div>

			{activeTab === "users" && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<div className={styles.tableContainer}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th>ID</th>
									<th>Username</th>
									<th>Email</th>
									<th>Роли</th>
									<th>Статус</th>
									<th>Действия</th>
								</tr>
							</thead>
							<tbody>
								{users.length === 0 ? (
									<tr>
										<td colSpan={6} className={styles.empty}>
											<div className={styles.emptyIcon}>👥</div>
											<p>Пользователи не найдены</p>
										</td>
									</tr>
								) : (
									users.map((user) => (
										<tr key={user.id}>
											<td>{user.id}</td>
											<td>
												<strong>{user.username}</strong>
												{user.id === currentUser?.id && " (Вы)"}
											</td>
											<td>{user.email}</td>
											<td>
												<div className={styles.rolesContainer}>
													{user.roles.map((r) => (
														<span
															key={r.role.id}
															className={`${styles.roleBadge} ${
																styles[getRoleColor(r.role.name)]
															}`}
														>
															{getRoleShortName(r.role.name)}
															{user.roles.length > 1 && (
																<button
																	onClick={() =>
																		handleRemoveRole(user.id, r.role.id)
																	}
																	style={{
																		marginLeft: "4px",
																		border: "none",
																		background: "none",
																		cursor: "pointer",
																		padding: 0,
																	}}
																	disabled={
																		processing === user.id ||
																		(user.id === currentUser?.id &&
																			r.role.id === 1)
																	}
																	title="Удалить роль"
																>
																	×
																</button>
															)}
														</span>
													))}
												</div>
											</td>
											<td>
												<span
													className={`${styles.statusBadge} ${
														user.isActive ? styles.active : styles.inactive
													}`}
												>
													{user.isActive ? "✓ Активен" : "✗ Неактивен"}
												</span>
											</td>
											<td>
												<div className={styles.actionButtons}>
													<Button
														size="sm"
														variant={user.isActive ? "danger" : "primary"}
														onClick={() =>
															toggleUserStatus(user.id, user.isActive)
														}
														loading={processing === user.id}
														disabled={
															user.id === currentUser?.id && user.isActive
														}
													>
														{user.isActive ? "Деактивировать" : "Активировать"}
													</Button>
													{editingUserId === user.id ? (
														<div className={styles.roleForm}>
															<select
																value={selectedRoleId}
																onChange={(e) =>
																	setSelectedRoleId(Number(e.target.value))
																}
																className={styles.select}
															>
																<option value={1}>ADMIN</option>
																<option value={2}>EDITOR</option>
																<option value={3}>SUBSCRIBER</option>
															</select>
															<Button
																size="sm"
																variant="primary"
																onClick={() => handleAddRole(user.id)}
																loading={processing === user.id}
															>
																Добавить
															</Button>
															<Button
																size="sm"
																variant="ghost"
																onClick={() => setEditingUserId(null)}
															>
																Отмена
															</Button>
														</div>
													) : (
														<Button
															size="sm"
															variant="outline"
															onClick={() => setEditingUserId(user.id)}
														>
															+ Роль
														</Button>
													)}
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</motion.div>
			)}

			{activeTab === "actions" && <LogsViewer type="user-actions" />}

			{activeTab === "http" && <LogsViewer type="http-errors" />}

			{activeTab === "app" && <LogsViewer type="app-errors" />}
		</div>
	);
};
