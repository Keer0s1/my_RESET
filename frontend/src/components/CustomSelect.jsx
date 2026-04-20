import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import styles from './CustomSelect.module.css';

const CustomSelect = ({ value, onChange, options, placeholder = "Выберите..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options.find(opt => opt.value === '') || options[0];

  return (
    <div className={styles.customSelect} ref={selectRef}>
      <button 
        type="button"
        className={`${styles.selectTrigger} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={styles.triggerText}>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={16} className={`${styles.icon} ${isOpen ? styles.iconOpen : ''}`} />
      </button>
      
      <div className={`${styles.optionsWrapper} ${isOpen ? styles.wrapperOpen : ''}`}>
        <ul className={styles.optionsList} role="listbox">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <span className={styles.optionLabel}>{option.label}</span>
                {isSelected && <Check size={16} className={styles.checkIcon} />}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default CustomSelect;
