// 403 Page - Forbidden

import { useNavigate } from "react-router-dom";
import styles from "./ErrorPage.module.css";

export const ForbiddenPage = () => {
	const navigate = useNavigate();

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<h1 className={styles.errorCode}>403</h1>
				<h2 className={styles.title}>Стоп! Вход воспрещён! 🚫</h2>
				<p className={styles.message}>
					У вас нет пропуска в эту секретную зону.
					<br />
					Возможно, вам стоит попросить права доступа у администратора 🔐
				</p>
				<div className={styles.actions}>
					<button
						onClick={() => navigate("/")}
						className={styles.primaryButton}
					>
						На главную
					</button>
					<button
						onClick={() => navigate("/login")}
						className={styles.secondaryButton}
					>
						Войти
					</button>
				</div>
				<div className={styles.emoji}>🔒 🚷 ⛔</div>
			</div>
		</div>
	);
};
