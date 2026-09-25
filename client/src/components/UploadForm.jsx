import { useRef, useState } from 'react';
import { uploadFile } from '../lib/api';
import { formatSize } from '../lib/format';
import { FileTypeBadge, UploadIcon, XIcon, LockIcon, EyeIcon, EyeOffIcon, DownloadIcon, AlertIcon } from './icons';

const TTL_OPTIONS = [
  { value: 3600, label: '1 час' },
  { value: 86400, label: '24 часа' },
  { value: 604800, label: '7 дней' },
  { value: 0, label: '∞' },
];

const DOWNLOAD_OPTIONS = [
  { value: 0, label: 'Без лимита' },
  { value: 1, label: '1 скачивание' },
  { value: 3, label: '3 скачивания' },
  { value: 5, label: '5 скачиваний' },
  { value: 10, label: '10 скачиваний' },
];

export default function UploadForm({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [ttl, setTtl] = useState(86400);
  const [maxDownloads, setMaxDownloads] = useState(0);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, loaded: 0, total: 0, speed: 0 });
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const speedRef = useRef({ lastTime: 0, lastLoaded: 0 });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  };

  const handleProgress = (loaded, total) => {
    const now = Date.now();
    const { lastTime, lastLoaded } = speedRef.current;
    let speed = progress.speed;
    if (lastTime && now > lastTime) {
      const instant = ((loaded - lastLoaded) / (now - lastTime)) * 1000;
      speed = speed ? speed * 0.7 + instant * 0.3 : instant;
    }
    speedRef.current = { lastTime: now, lastLoaded: loaded };
    setProgress({ percent: Math.round((loaded / total) * 100), loaded, total, speed });
  };

  const handleUpload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    setError('');
    setProgress({ percent: 0, loaded: 0, total: file.size, speed: 0 });
    speedRef.current = { lastTime: 0, lastLoaded: 0 };

    try {
      const result = await uploadFile(
        file,
        { ttl, maxDownloads, password: password.trim() },
        handleProgress,
      );
      onSuccess(result);
    } catch (err) {
      setError(err.message || 'Ошибка загрузки файла. Попробуйте ещё раз.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card upload-card">
      <div
        className={`dropzone ${dragActive ? 'drag' : ''} ${file ? 'has-file' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
          style={{ display: 'none' }}
        />

        {file ? (
          <div className="file-chip">
            <FileTypeBadge name={file.name} />
            <div className="file-chip-info">
              <span className="file-chip-name" title={file.name}>{file.name}</span>
              <span className="file-chip-size">{formatSize(file.size)}</span>
            </div>
            <button
              type="button"
              className="icon-btn"
              aria-label="Убрать файл"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
            >
              <XIcon size={16} />
            </button>
          </div>
        ) : (
          <div className="dropzone-inner">
            <span className="dropzone-icon"><UploadIcon size={26} /></span>
            <p className="dropzone-title">Перетащите файл сюда</p>
            <p className="dropzone-hint">или нажмите, чтобы выбрать</p>
            <p className="dropzone-note">Любые файлы до 2 ГБ</p>
          </div>
        )}
      </div>

      <div className="options">
        <div className="option-group">
          <span className="option-label">Хранить</span>
          <div className="chip-row">
            {TTL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`chip ${ttl === opt.value ? 'chip-active' : ''}`}
                onClick={() => setTtl(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="option-grid">
          <div className="option-field">
            <span className="option-label"><LockIcon size={14} /> Пароль</span>
            <div className="input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Необязательно"
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
          </div>

          <div className="option-field">
            <span className="option-label"><DownloadIcon size={14} /> Лимит скачиваний</span>
            <div className="input-wrap">
              <select value={maxDownloads} onChange={(e) => setMaxDownloads(Number(e.target.value))}>
                {DOWNLOAD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-msg">
          <AlertIcon size={16} />
          {error}
        </div>
      )}

      {uploading && (
        <div className="progress">
          <div className="progress-head">
            <span>{progress.percent}%</span>
            <span>
              {formatSize(progress.loaded)} / {formatSize(progress.total)}
              {progress.speed > 0 && ` · ${formatSize(progress.speed)}/с`}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress.percent}%` }} />
          </div>
        </div>
      )}

      <button type="button" className="btn btn-primary btn-lg" onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Загрузка…' : 'Загрузить и получить ссылку'}
      </button>
    </div>
  );
}
