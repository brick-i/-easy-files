import { useEffect, useState } from 'react';
import { getInfo, verifyPassword } from '../lib/api';
import { formatSize, formatDate } from '../lib/format';
import { FileTypeBadge, DownloadIcon, LockIcon, EyeIcon, EyeOffIcon, ClockIcon, AlertIcon } from './icons';

export default function DownloadPage({ id }) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getInfo(id)
      .then(setInfo)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Скачиваем нативным POST: браузер сам показывает прогресс и пишет на диск,
  // так что файлы на 2 ГБ не держатся в памяти вкладки.
  const submitNative = () => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/api/download/${id}`;
    form.style.display = 'none';
    if (password) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'password';
      input.value = password;
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
    setTimeout(() => document.body.removeChild(form), 10_000);
  };

  const handleDownload = async () => {
    if (busy) return;
    setBusy(true);
    setError('');

    try {
      if (info?.hasPassword) {
        await verifyPassword(id, password);
      }
      submitNative();
    } catch (err) {
      setError(err.status === 403 ? 'Неверный пароль' : err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="card center-card">
        <div className="spinner" />
        <p className="dim">Загрузка информации…</p>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="card center-card">
        <span className="state-icon si-red"><AlertIcon size={26} /></span>
        <h2>{error || 'Файл не найден'}</h2>
        <p className="dim">
          {error.includes('Срок хранения')
            ? 'Файл удалён с сервера. Попросите отправителя загрузить его заново.'
            : 'Возможно, файл удалён или ссылка неверна.'}
        </p>
        <a className="btn btn-ghost" href="/">Загрузить свой файл</a>
      </div>
    );
  }

  return (
    <div className="card download-card">
      <div className="file-row">
        <FileTypeBadge name={info.originalName} size={56} />
        <div className="file-row-info">
          <span className="file-row-name" title={info.originalName}>{info.originalName}</span>
          <div className="chip-row">
            <span className="chip">{formatSize(info.size)}</span>
            <span className="chip">
              <ClockIcon size={13} />
              {info.expiresAt ? `удалится ${formatDate(info.expiresAt)}` : 'бессрочно'}
            </span>
            <span className="chip">скачиваний: {info.downloads}{info.maxDownloads ? ` / ${info.maxDownloads}` : ''}</span>
          </div>
        </div>
      </div>

      {info.hasPassword && (
        <div className="option-field">
          <span className="option-label"><LockIcon size={14} /> Файл защищён паролем</span>
          <div className="input-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDownload()}
              placeholder="Введите пароль"
              autoFocus
              maxLength={100}
            />
            <button
              type="button"
              className="icon-btn"
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
          <p className="hint"><LockIcon size={13} /> Пароль должен был прийти вам вместе со ссылкой</p>
        </div>
      )}

      {error && (
        <div className="error-msg">
          <AlertIcon size={16} />
          {error}
        </div>
      )}

      <button
        type="button"
        className="btn btn-primary btn-lg"
        onClick={handleDownload}
        disabled={busy || (info.hasPassword && !password)}
      >
        <DownloadIcon size={19} />
        {busy ? 'Проверяю…' : 'Скачать файл'}
      </button>
    </div>
  );
}
