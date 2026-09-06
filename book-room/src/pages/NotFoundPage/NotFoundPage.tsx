import { Link } from "react-router-dom";
import styles from "./NotFoundPage.module.css";

export const NotFoundPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.errorCode}>404</h1>
      <h2 className={styles.title}>Страница не найдена</h2>
      <p className={styles.subtitle}>
      Запрашиваемая страница не существует, была удалена или перенесена на другой адрес.
      </p>
      <Link
        to="/rooms"
        className={styles.homeButton}
        style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}
      >
        <svg
          width="16"
          height="17"
          viewBox="0 0 16 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 15.25V9.25C10 9.05109 9.92098 8.86032 9.78033 8.71967C9.63968 8.57902 9.44891 8.5 9.25 8.5H6.25C6.05109 8.5 5.86032 8.57902 5.71967 8.71967C5.57902 8.86032 5.5 9.05109 5.5 9.25V15.25M1 7.00036C0.999948 6.78216 1.0475 6.56658 1.13934 6.36865C1.23118 6.17072 1.3651 5.99521 1.53175 5.85436L6.78175 1.35436C7.05249 1.12554 7.39552 1 7.75 1C8.10448 1 8.44751 1.12554 8.71825 1.35436L13.9683 5.85436C14.1349 5.99521 14.2688 6.17072 14.3607 6.36865C14.4525 6.56658 14.5001 6.78216 14.5 7.00036V13.7504C14.5 14.1482 14.342 14.5297 14.0607 14.811C13.7794 15.0923 13.3978 15.2504 13 15.2504H2.5C2.10218 15.2504 1.72064 15.0923 1.43934 14.811C1.15804 14.5297 1 14.1482 1 13.7504V7.00036Z"
          stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Вернуться к переговорным
      </Link>
    </div>
  );
};
