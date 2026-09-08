import { useEffect } from "react";
import { SuccesIcon } from "../../ui/icons"
import styles from "./SuccessToast.module.css";

interface SuccessToastProps {
  roomName: string;
  dateTimeText: string;
  title?: string;
  onClose: () => void;
}

export const SuccessToast = ({
  roomName,
  dateTimeText,
  title = "Бронирование создано",
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
        <SuccesIcon />
      </div>

      <div>
        <h4 className={styles.title}>
          {title}
        </h4>

        <p className={styles.subtitle}>
          Комната {roomName}, {dateTimeText}
        </p>
      </div>
    </div>
  );
};