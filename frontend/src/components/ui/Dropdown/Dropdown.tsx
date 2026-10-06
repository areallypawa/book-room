import { useRef, useEffect } from "react";
import styles from "./Dropdown.module.css";
import { ChevronDownIcon, CheckIcon } from "../icons";

export interface DropdownOption {
  label: string;
  value: string | number;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string | number | null;
  onChange: (value: any) => void;
  icon?: React.ReactNode;
  prefix?: string;
  placeholder?: string;
  isOpen: boolean; 
  className?: string
  onToggle: (isOpen: boolean) => void;
  onClose: () => void;
}

export const Dropdown = ({ 
  options, 
  value, 
  onChange, 
  icon, 
  prefix = "", 
  placeholder = "Выберите...",
  isOpen,
  onToggle,
  onClose,
  className
}: DropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (dropdownRef.current && dropdownRef.current.contains(target)) return;
      onClose(); 
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`${styles.container} ${className || ""}`} ref={dropdownRef}>
      <button
        type="button"
        className={styles.button}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => onToggle(!isOpen)}
      >
        <span className={styles.triggerContent}>
          {icon}
          {selectedOption ? `${prefix} ${selectedOption.label}` : placeholder}
        </span>
        
        <ChevronDownIcon
          style={{
            marginLeft: "8px",
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </button>

      <div className={`${styles.menu} ${isOpen ? styles.menuOpen : ""}`}>
        {options.map((opt) => (
          <div
            key={opt.value}
            className={`${styles.item} ${value === opt.value ? styles.itemActive : ""}`}
            onClick={() => {
              onChange(opt.value);
              onClose(); // Закрываем при выборе
            }}
          >
            {opt.label}
            {value === opt.value && <CheckIcon />}
          </div>
        ))}
      </div>
    </div>
  );
};