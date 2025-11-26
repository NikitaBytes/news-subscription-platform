// 404 Page - Not Found

import { useNavigate } from "react-router-dom";
import styles from "./ErrorPage.module.css";

export const NotFoundPage = () => {
	const navigate = useNavigate();

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<h1 className={styles.errorCode}>404</h1>
				<h2 className={styles.title}>Упс! Страница улетела в космос 🚀</h2>
				<p className={styles.message}>
					Похоже, эта страница решила отправиться в путешествие без нас.
				</p>
				<div className={styles.actions}>
					<button
						onClick={() => navigate("/")}
						className={styles.primaryButton}
					>
						Вернуться на главную
					</button>
					<button
						onClick={() => navigate(-1)}
						className={styles.secondaryButton}
					>
						Назад
					</button>
				</div>
			</div>
		</div>
	);
};
