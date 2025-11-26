// Logs Viewer Component with Pagination and Filtering

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { apiClient } from "../../api/client";
import { Button } from "../ui";
import styles from "./LogsViewer.module.css";

interface LogsViewerProps {
	type: "user-actions" | "http-errors" | "app-errors";
}

interface Log {
	id: number;
	createdAt: string;
	actionType?: string;
	statusCode?: number;
	method?: string;
	errorType?: string;
	message?: string;
	url?: string;
	ipAddress?: string;
	user?: {
		id: number;
		username: string;
		email: string;
	};
}

interface Pagination {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export const LogsViewer: React.FC<LogsViewerProps> = ({ type }) => {
	const [logs, setLogs] = useState<Log[]>([]);
	const [pagination, setPagination] = useState<Pagination>({
		page: 1,
		limit: 20,
		total: 0,
		totalPages: 0,
	});
	const [loading, setLoading] = useState(false);

	// Фильтры
	const [search, setSearch] = useState("");
	const [statusCode, setStatusCode] = useState("");
	const [method, setMethod] = useState("");
	const [actionType, setActionType] = useState("");
	const [errorType, setErrorType] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [sortBy, setSortBy] = useState("createdAt");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

	// Списки для селектов
	const [actionTypes, setActionTypes] = useState<string[]>([]);
	const [errorTypes, setErrorTypes] = useState<string[]>([]);

	// Debounced search
	const [debouncedSearch, setDebouncedSearch] = useState(search);

	// Debounce search input
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search);
		}, 500);
		return () => clearTimeout(timer);
	}, [search]);

	// Reset to page 1 when filters change
	useEffect(() => {
		if (pagination.page !== 1) {
			setPagination((prev) => ({ ...prev, page: 1 }));
		}
	}, [
		debouncedSearch,
		statusCode,
		method,
		actionType,
		errorType,
		startDate,
		endDate,
	]);

	useEffect(() => {
		loadLogs();
		if (type === "user-actions") {
			loadActionTypes();
		} else if (type === "app-errors") {
			loadErrorTypes();
		}
	}, [
		type,
		pagination.page,
		pagination.limit,
		sortBy,
		sortOrder,
		debouncedSearch,
		statusCode,
		method,
		actionType,
		errorType,
		startDate,
		endDate,
	]);

	const loadLogs = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams({
				page: pagination.page.toString(),
				limit: pagination.limit.toString(),
				sortBy,
				sortOrder,
			});

			if (debouncedSearch) params.append("search", debouncedSearch);
			if (startDate) params.append("startDate", startDate);
			if (endDate) params.append("endDate", endDate);

			if (type === "user-actions" && actionType) {
				params.append("actionType", actionType);
			} else if (type === "http-errors") {
				if (statusCode) params.append("statusCode", statusCode);
				if (method) params.append("method", method);
			} else if (type === "app-errors" && errorType) {
				params.append("errorType", errorType);
			}

			const { data } = await apiClient.get(`/logs/${type}?${params}`);

			if (data.success) {
				setLogs(data.data);
				if (data.pagination) {
					setPagination(data.pagination);
				}
			}
		} catch (error) {
			console.error("Ошибка загрузки логов:", error);
		} finally {
			setLoading(false);
		}
	};

	const loadActionTypes = async () => {
		try {
			const { data } = await apiClient.get("/logs/user-actions/types");
			if (data.success) {
				setActionTypes(data.data);
			}
		} catch (error) {
			console.error("Ошибка загрузки типов действий:", error);
		}
	};

	const loadErrorTypes = async () => {
		try {
			const { data } = await apiClient.get("/logs/app-errors/types");
			if (data.success) {
				setErrorTypes(data.data);
			}
		} catch (error) {
			console.error("Ошибка загрузки типов ошибок:", error);
		}
	};

	const handleResetFilters = () => {
		setSearch("");
		setStatusCode("");
		setMethod("");
		setActionType("");
		setErrorType("");
		setStartDate("");
		setEndDate("");
		setSortBy("createdAt");
		setSortOrder("desc");
		setPagination({ ...pagination, page: 1 });
	};

	const handlePageChange = (newPage: number) => {
		setPagination({ ...pagination, page: newPage });
	};

	const handleLimitChange = (newLimit: number) => {
		setPagination({ ...pagination, limit: newLimit, page: 1 });
	};

	const renderFilters = () => (
		<div className={styles.filters}>
			<div className={styles.filterRow}>
				<div className={styles.filterGroup}>
					<label>🔍 Поиск</label>
					<input
						type="text"
						placeholder="Поиск по содержимому..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className={styles.input}
					/>
				</div>

				<div className={styles.filterGroup}>
					<label>📅 Дата от</label>
					<input
						type="datetime-local"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						className={styles.input}
					/>
				</div>

				<div className={styles.filterGroup}>
					<label>📅 Дата до</label>
					<input
						type="datetime-local"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						className={styles.input}
					/>
				</div>
			</div>

			<div className={styles.filterRow}>
				{type === "user-actions" && (
					<div className={styles.filterGroup}>
						<label>📝 Тип действия</label>
						<select
							value={actionType}
							onChange={(e) => setActionType(e.target.value)}
							className={styles.select}
						>
							<option value="">Все типы</option>
							{actionTypes.map((type) => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</select>
					</div>
				)}

				{type === "http-errors" && (
					<>
						<div className={styles.filterGroup}>
							<label>🔢 HTTP код</label>
							<select
								value={statusCode}
								onChange={(e) => setStatusCode(e.target.value)}
								className={styles.select}
							>
								<option value="">Все коды</option>
								<option value="400">400 Bad Request</option>
								<option value="401">401 Unauthorized</option>
								<option value="403">403 Forbidden</option>
								<option value="404">404 Not Found</option>
								<option value="500">500 Internal Error</option>
								<option value="502">502 Bad Gateway</option>
								<option value="503">503 Service Unavailable</option>
							</select>
						</div>

						<div className={styles.filterGroup}>
							<label>🔧 HTTP метод</label>
							<select
								value={method}
								onChange={(e) => setMethod(e.target.value)}
								className={styles.select}
							>
								<option value="">Все методы</option>
								<option value="GET">GET</option>
								<option value="POST">POST</option>
								<option value="PUT">PUT</option>
								<option value="DELETE">DELETE</option>
								<option value="PATCH">PATCH</option>
							</select>
						</div>
					</>
				)}

				{type === "app-errors" && (
					<div className={styles.filterGroup}>
						<label>⚠️ Тип ошибки</label>
						<select
							value={errorType}
							onChange={(e) => setErrorType(e.target.value)}
							className={styles.select}
						>
							<option value="">Все типы</option>
							{errorTypes.map((type) => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</select>
					</div>
				)}

				<div className={styles.filterGroup}>
					<label>📊 Сортировка</label>
					<div className={styles.sortControls}>
						<select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value)}
							className={styles.select}
						>
							<option value="createdAt">По дате</option>
							<option value="id">По ID</option>
							{type === "http-errors" && (
								<option value="statusCode">По коду</option>
							)}
						</select>
						<button
							onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
							className={styles.sortButton}
							title={sortOrder === "asc" ? "По возрастанию" : "По убыванию"}
						>
							{sortOrder === "asc" ? "↑" : "↓"}
						</button>
					</div>
				</div>
			</div>

			<div className={styles.filterActions}>
				<Button variant="ghost" onClick={handleResetFilters}>
					🔄 Сбросить фильтры
				</Button>
			</div>
		</div>
	);

	const renderPagination = () => (
		<div className={styles.pagination}>
			<div className={styles.paginationInfo}>
				Показано{" "}
				{Math.min(
					(pagination.page - 1) * pagination.limit + 1,
					pagination.total
				)}{" "}
				- {Math.min(pagination.page * pagination.limit, pagination.total)} из{" "}
				{pagination.total}
			</div>

			<div className={styles.paginationControls}>
				<select
					value={pagination.limit}
					onChange={(e) => handleLimitChange(Number(e.target.value))}
					className={styles.limitSelect}
				>
					<option value={10}>10 / страница</option>
					<option value={20}>20 / страница</option>
					<option value={50}>50 / страница</option>
					<option value={100}>100 / страница</option>
				</select>

				<div className={styles.pageButtons}>
					<button
						onClick={() => handlePageChange(1)}
						disabled={pagination.page === 1}
						className={styles.pageButton}
					>
						⏮ Первая
					</button>
					<button
						onClick={() => handlePageChange(pagination.page - 1)}
						disabled={pagination.page === 1}
						className={styles.pageButton}
					>
						← Назад
					</button>

					<span className={styles.pageInfo}>
						Страница {pagination.page} из {pagination.totalPages}
					</span>

					<button
						onClick={() => handlePageChange(pagination.page + 1)}
						disabled={pagination.page === pagination.totalPages}
						className={styles.pageButton}
					>
						Вперед →
					</button>
					<button
						onClick={() => handlePageChange(pagination.totalPages)}
						disabled={pagination.page === pagination.totalPages}
						className={styles.pageButton}
					>
						Последняя ⏭
					</button>
				</div>
			</div>
		</div>
	);

	const renderUserActionsTable = () => (
		<table className={styles.table}>
			<thead>
				<tr>
					<th>ID</th>
					<th>Дата и время</th>
					<th>Пользователь</th>
					<th>Действие</th>
					<th>IP адрес</th>
				</tr>
			</thead>
			<tbody>
				{logs.length === 0 ? (
					<tr>
						<td colSpan={5} className={styles.empty}>
							📝 Логи действий не найдены
						</td>
					</tr>
				) : (
					logs.map((log) => (
						<tr key={log.id}>
							<td>{log.id}</td>
							<td>{new Date(log.createdAt).toLocaleString("ru-RU")}</td>
							<td>{log.user?.username || "Гость"}</td>
							<td>
								<span className={styles.actionType}>{log.actionType}</span>
							</td>
							<td className={styles.ip}>{log.ipAddress || "N/A"}</td>
						</tr>
					))
				)}
			</tbody>
		</table>
	);

	const renderHttpErrorsTable = () => (
		<table className={styles.table}>
			<thead>
				<tr>
					<th>ID</th>
					<th>Дата и время</th>
					<th>Код</th>
					<th>Метод</th>
					<th>URL</th>
					<th>IP</th>
				</tr>
			</thead>
			<tbody>
				{logs.length === 0 ? (
					<tr>
						<td colSpan={6} className={styles.empty}>
							🔴 HTTP ошибки не найдены
						</td>
					</tr>
				) : (
					logs.map((log) => (
						<tr key={log.id}>
							<td>{log.id}</td>
							<td>{new Date(log.createdAt).toLocaleString("ru-RU")}</td>
							<td>
								<span
									className={`${styles.statusCode} ${
										log.statusCode && log.statusCode >= 500
											? styles.error5xx
											: styles.error4xx
									}`}
								>
									{log.statusCode}
								</span>
							</td>
							<td>
								<span className={styles.method}>{log.method}</span>
							</td>
							<td className={styles.url}>{log.url}</td>
							<td className={styles.ip}>{log.ipAddress || "N/A"}</td>
						</tr>
					))
				)}
			</tbody>
		</table>
	);

	const renderAppErrorsTable = () => (
		<table className={styles.table}>
			<thead>
				<tr>
					<th>ID</th>
					<th>Дата и время</th>
					<th>Тип</th>
					<th>Сообщение</th>
					<th>URL</th>
				</tr>
			</thead>
			<tbody>
				{logs.length === 0 ? (
					<tr>
						<td colSpan={5} className={styles.empty}>
							⚠️ Ошибки приложения не найдены
						</td>
					</tr>
				) : (
					logs.map((log) => (
						<tr key={log.id}>
							<td>{log.id}</td>
							<td>{new Date(log.createdAt).toLocaleString("ru-RU")}</td>
							<td>
								<span className={styles.errorType}>{log.errorType}</span>
							</td>
							<td className={styles.message}>{log.message}</td>
							<td className={styles.url}>{log.url || "N/A"}</td>
						</tr>
					))
				)}
			</tbody>
		</table>
	);

	return (
		<motion.div
			className={styles.container}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
		>
			{renderFilters()}

			{loading ? (
				<div className={styles.loading}>⏳ Загрузка логов...</div>
			) : (
				<>
					<div className={styles.tableContainer}>
						{type === "user-actions" && renderUserActionsTable()}
						{type === "http-errors" && renderHttpErrorsTable()}
						{type === "app-errors" && renderAppErrorsTable()}
					</div>

					{pagination.total > 0 && renderPagination()}
				</>
			)}
		</motion.div>
	);
};
