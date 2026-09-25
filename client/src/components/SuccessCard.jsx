import { useState } from 'react';
import { deleteFile } from '../lib/api';
import { formatSize, formatDate } from '../lib/format';
import { CheckIcon, CopyIcon, LinkIcon, LockIcon, ClockIcon, QrIcon, TrashIcon, RefreshIcon, AlertIcon } from './icons';

export default function SuccessCard({ file, onReset }) {
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(file.link);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = file.link;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleQr = async () => {
    if (showQr) {
      setShowQr(false);
      return;
    }
    if (!qr) {
      const { toDataURL } = await import('qrcode');
      setQr(await toDataURL(file.link, { margin: 1, width: 220, color: { dark: '#0b1120', light: '#ffffff' } }));
    }
    setShowQr(true);
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    setError('');
    try {
      await deleteFile(file.id, file.deleteToken);
      onReset();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  return (
    <div className="card success-card">
      <div className="success-head">
        <span className="success-check"><CheckIcon size={26} /></span>
        <div>
          <h2>Ссылка готова</h2>
          <p>Отправьте её получателю любым способом</p>
        </div>
      </div>

      <div className="file-row">
        <FileTypeBadge name={file.originalName} />
        <div className="file-row-info">
          <span className="file-row-name" title={file.originalName}>{file.originalName}</span>
          <div className="chip-row">
            <span className="chip">{formatSize(file.size)}</span>
            <span className="chip">
              <ClockIcon size={13} />
              {file.expiresAt ? `удалится ${formatDate(file.expiresAt)}` : 'бессрочно'}
            </span>
            {file.hasPassword && <span className="chip"><LockIcon size={13} /> пароль</span>}
            {file.maxDownloads > 0 && <span className="chip">лимит: {file.maxDownloads}</span>}
          </div>
        </div>
      </div>

      <div className="link-box">
        <input type="text" value={file.link} readOnly onFocus={(e) => e.target.select()} />
        <button type="button" className={`btn ${copied ? 'btn-copied' : 'btn-ghost'}`} onClick={copyLink}>
          {copied ? <><CheckIcon size={16} /> Готово</> : <><CopyIcon size={16} /> Копировать</>}
        </button>
      </div>

      {showQr && (
        <div className="qr-box">
          <img src={qr} alt="QR-код со ссылкой" />
          <p>Наведите камеру телефона, чтобы открыть ссылку</p>
        </div>
      )}

      {file.hasPassword && (
        <p className="hint">
          <LockIcon size={14} /> Пароль нужно передать получателю отдельно — по телефону, в мессенджере и т.д.
        </p>
      )}

      {error && (
        <div className="error-msg">
          <AlertIcon size={16} />
          {error}
        </div>
      )}

      <div className="btn-row">
        <button type="button" className="btn btn-primary" onClick={onReset}>
          <RefreshIcon size={16} /> Загрузить ещё
        </button>
        <button type="button" className="btn btn-ghost" onClick={toggleQr}>
          <QrIcon size={16} /> {showQr ? 'Скрыть QR' : 'QR-код'}
        </button>
        <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
          <TrashIcon size={16} /> {deleting ? 'Удаляю…' : 'Удалить'}
        </button>
      </div>
    </div>
  );
}
