import type { ReactNode } from "react";
import type { Room } from "../../types/index";
import styles from "./RoomInfo.module.css";
import { DisplayIcon, WhiteboardIcon, VideoIcon, CapacityGreenIcon } from "../ui/icons";

interface RoomInfoProps {
  room: Room;
  officeName: string;
}

const featureIcons: Record<string, ReactNode> = {
  display: <DisplayIcon />,
  whiteboard: <WhiteboardIcon />,
  video: <VideoIcon />,
};

export const RoomInfo = ({ room, officeName }: RoomInfoProps) => {
  return (
    <div className={styles.infoCard}>
      <h1 className={styles.roomTitle}>{room.name}</h1>
      <p className={styles.roomSubtitle}>Офис {officeName} · ул. Лесная 7</p>

      <div className={styles.featuresList}>
        <div className={styles.featureItem}>
          <CapacityGreenIcon />
          Вместимость: до {room.capacity} человек
        </div>

        {room.features?.map((feature) => (
          <div key={feature.code} className={styles.featureItem}>
            {featureIcons[feature.code]}
            {feature.name}
          </div>
        ))}
      </div>
    </div>
  );
};