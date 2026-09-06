import { useState } from "react";
import { BookingModal } from "../BookingModal/BookingModal";
import { SuccessToast } from "../SuccesToast/SuccessToast";
import styles from "./BookigButton.module.css"; 

interface BookingButtonProps {
  room: { id: string; name: string; floor: number; available?: boolean };
  selectedDate: Date;
  initialTime?: string;      
  initialDuration?: number;  
}

export const BookingButton = ({ 
  room, 
  selectedDate, 
  initialTime = "15:00", 
  initialDuration = 60 
}: BookingButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState(""); 
  
  const isAvailable = room.available !== false;

  return (
    <>
      <button 
        className={`${styles.btnBook} ${!isAvailable ? styles.btnBookDisabled : ""}`} 
        disabled={!isAvailable}
        onClick={() => setIsModalOpen(true)}
      >
        Забронировать
      </button>

      <BookingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        roomId={room.id}
        roomName={room.name}
        floor={room.floor}
        initialDate={selectedDate}
        initialTime={initialTime}
        initialDuration={initialDuration}
          onSuccess={(text) => {
          setToastText(text); 
          setShowToast(true);
          setIsModalOpen(false);
        }}
      />

      {showToast && (
        <SuccessToast 
          roomName={room.name}
          dateTimeText={`${toastText} MSK`} 
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
};