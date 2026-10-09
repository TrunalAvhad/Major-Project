import React, { useCallback, useState } from 'react';
import Modal from './Modal';

/**
 * Themed replacement for window.confirm:
 *   const [confirmDialog, confirm] = useConfirm();
 *   if (!(await confirm({ title, message, confirmLabel, danger: true }))) return;
 *   ...render {confirmDialog} somewhere in the component.
 */
export function useConfirm() {
  const [request, setRequest] = useState(null);
  const confirm = useCallback((opts) => new Promise((resolve) => setRequest({ ...opts, resolve })), []);
  const close = (answer) => {
    request?.resolve(answer);
    setRequest(null);
  };

  const dialog = (
    <Modal isOpen={!!request} onClose={() => close(false)} title={request?.title || 'Please confirm'} maxWidth="460px">
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '18px', whiteSpace: 'pre-line' }}>
        {request?.message}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button className="btn btn-secondary" onClick={() => close(false)}>Cancel</button>
        <button className={`btn ${request?.danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => close(true)} autoFocus>
          {request?.confirmLabel || 'Confirm'}
        </button>
      </div>
    </Modal>
  );
  return [dialog, confirm];
}
