import { useEffect } from "react";
import { ErrorBigIcon } from "../../ui/icons"; 
import styles from "./ErrorToast.module.css";

interface ErrorToastProps {
  title?: string;
  message: string;
  onClose: () => void;
}

export const ErrorToast = ({
  title = "Ошибка",
  message,
  onClose,
}: ErrorToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); 

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={styles.toastWrapper}>
      <div className={styles.iconBox}>
        <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ErrorBigIcon />
        </div>
      </div>

      <div>
        <h4 className={styles.title}>
          {title}
        </h4>
        <p className={styles.subtitle}>
          {message}
        </p>
      </div>
    </div>
  );
};