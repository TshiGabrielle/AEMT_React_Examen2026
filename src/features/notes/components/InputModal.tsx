import { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
}

export function InputModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  label,
  placeholder = '',
  defaultValue = '',
  confirmText = 'Confirmer',
  cancelText = 'Annuler'
}: InputModalProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      // Focus sur l'input après l'ouverture de la modale
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
      onClose();
    }
  };

  const handleCancel = () => {
    setValue(defaultValue);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title={title}>
      <form onSubmit={handleSubmit} className="modal-form">
        <label className="modal-label">{label}</label>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="modal-input"
          autoFocus
        />
        <div className="modal-actions">
          <button type="button" onClick={handleCancel} className="modal-btn modal-btn-cancel">
            {cancelText}
          </button>
          <button type="submit" className="modal-btn modal-btn-confirm" disabled={!value.trim()}>
            {confirmText}
          </button>
        </div>
      </form>
    </Modal>
  );
}
