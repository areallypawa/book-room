import { useEffect } from "react";
import styles from "./SuccessToast.module.css";

interface SuccessToastProps {
  roomName: string;
  dateTimeText: string;
  onClose: () => void;
}

export const SuccessToast = ({
  roomName,
  dateTimeText,
  onClose,
}: SuccessToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={styles.toastWrapper}>
      <div className={styles.iconBox}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.666 5L7.50023 14.166L3.33398 9.99964"
            stroke="#065F46"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div>
        <h4 className={styles.title}>
          Бронирование создано
        </h4>

        <p className={styles.subtitle}>
          Комната {roomName}, {dateTimeText}
        </p>
      </div>
    </div>
  );
};

