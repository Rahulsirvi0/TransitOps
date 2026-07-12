import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Confirm Action', message, confirmText = 'Confirm', cancelText = 'Cancel', loading = false, variant = 'danger' }) {
  const variants = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-amber-600 hover:bg-amber-700',
    primary: 'bg-primary-600 hover:bg-primary-700'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className="text-center">
        <AlertTriangle className={`mx-auto mb-4 ${variant === 'danger' ? 'text-red-500' : 'text-amber-500'}`} size={40} />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="btn-secondary" disabled={loading}>{cancelText}</button>
          <button onClick={onConfirm} className={`${variants[variant]} text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50`} disabled={loading}>
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}