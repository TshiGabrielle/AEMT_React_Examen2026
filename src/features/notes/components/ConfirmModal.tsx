import { Modal } from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  danger = false
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="modal-form">
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button type="button" onClick={onClose} className="modal-btn modal-btn-cancel">
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`modal-btn ${danger ? 'modal-btn-danger' : 'modal-btn-confirm'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
