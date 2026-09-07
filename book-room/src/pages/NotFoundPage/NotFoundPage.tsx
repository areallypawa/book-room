import { Link } from "react-router-dom";
import styles from "./NotFoundPage.module.css";
import { HomeIcon } from "../../components/ui/icons";

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
        <HomeIcon />
        Вернуться к переговорным
      </Link>
    </div>
  );
};
