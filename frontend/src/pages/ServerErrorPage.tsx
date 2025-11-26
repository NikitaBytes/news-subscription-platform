// 500 Page - Server Error

import { useNavigate } from "react-router-dom";
import styles from "./ErrorPage.module.css";

export const ServerErrorPage = () => {
	const navigate = useNavigate();

	const handleReload = () => {
		window.location.reload();
	};

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<h1 className={styles.errorCode}>500</h1>
				<h2 className={styles.title}>Хьюстон, у нас проблемы! 🛸</h2>
				<p className={styles.message}>
					Наш сервер решил взять внеплановый отпуск.
					<br />
					Наши лучшие инженеры уже бегут с гаечными ключами! 🔧
				</p>
				<div className={styles.actions}>
					<button onClick={handleReload} className={styles.primaryButton}>
						Попробовать снова
					</button>
					<button
						onClick={() => navigate("/")}
						className={styles.secondaryButton}
					>
						На главную
					</button>
				</div>
				<div className={styles.emoji}>⚙️ 🔥 💻</div>
			</div>
		</div>
	);
};
