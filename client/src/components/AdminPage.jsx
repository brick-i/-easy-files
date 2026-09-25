import { useState } from 'react';
import { adminList, adminDelete } from '../lib/api';
import { formatSize, formatDate } from '../lib/format';
import { KeyIcon, ShieldIcon, DatabaseIcon, FileIcon, TrashIcon, RefreshIcon, AlertIcon, LockIcon, LinkIcon } from './icons';

const KEY_STORAGE = 'easyfiles-admin-key';

export default function AdminPage() {
  const [key, setKey] = useState(sessionStorage.getItem(KEY_STORAGE) || '');
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [disabledNotice, setDisabledNotice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = async (adminKey) => {
    setLoading(true);
    setError('');
    try {
      const result = await adminList(adminKey);
      sessionStorage.setItem(KEY_STORAGE, adminKey);
      setData(result);
      setAuthed(true);
    } catch (err) {
      if (err.data?.disabled) {
        setDisabledNotice(true);
      } else {
        setError(err.status === 401 ? 'Неверный ключ доступа' : err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить файл с сервера?')) return;
    setBusyId(id);
    try {
      await adminDelete(key, id);
      await load(key);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (!authed) {
    return (
      <div className="card center-card admin-gate">
        <span className="state-icon si-violet"><ShieldIcon size={26} /></span>
        <h2>Админ-панель</h2>
        {disabledNotice ? (
          <>
            <p className="dim">
              Панель отключена на сервере. Запустите EasyFiles с переменной окружения <code>ADMIN_KEY</code>, чтобы ей пользоваться.
            </p>
            <a className="btn btn-ghost" href="/">На главную</a>
          </>
        ) : (
          <>
            <p className="dim">Введите ключ доступа, заданный в переменной <code>ADMIN_KEY</code></p>
            <div className="input-wrap input-wide">
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && load(e.target.value)}
                placeholder="Ключ доступа"
                autoFocus
              />
              <span className="input-adorn"><KeyIcon size={16} /></span>
            </div>
            {error && (
              <div className="error-msg"><AlertIcon size={16} /> {error}</div>
            )}
            <button type="button" className="btn btn-primary" onClick={() => load(key)} disabled={!key || loading}>
              {loading ? 'Проверяю…' : 'Войти'}
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="page page--wide">
      <div className="admin-head">
        <h2><ShieldIcon size={22} /> Файлы на сервере</h2>
        <button type="button" className="btn btn-ghost" onClick={() => load(key)}>
          <RefreshIcon size={16} /> Обновить
        </button>
      </div>

      <div className="admin-stats">
        <div className="stat">
          <span className="stat-icon fi-violet"><FileIcon size={18} /></span>
          <div><b>{data.stats.count}</b><span>файлов</span></div>
        </div>
        <div className="stat">
          <span className="stat-icon fi-cyan"><DatabaseIcon size={18} /></span>
          <div><b>{formatSize(data.stats.totalSize)}</b><span>занято</span></div>
        </div>
      </div>

      {error && <div className="error-msg"><AlertIcon size={16} /> {error}</div>}

      {data.files.length === 0 ? (
        <div className="card center-card">
          <p className="dim">Пока ни одного файла</p>
        </div>
      ) : (
        <div className="card table-card">
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Файл</th>
                  <th>Размер</th>
                  <th>Скачивания</th>
                  <th>Загружен</th>
                  <th>Удалится</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.files.map((f) => (
                  <tr key={f.id} className={f.expired ? 'row-expired' : ''}>
                    <td>
                      <span className="table-name" title={f.originalName}>
                        {f.hasPassword && <LockIcon size={13} />}
                        {f.originalName}
                      </span>
                    </td>
                    <td>{formatSize(f.size)}</td>
                    <td>{f.downloads}{f.maxDownloads ? ` / ${f.maxDownloads}` : ''}</td>
                    <td>{formatDate(f.createdAt)}</td>
                    <td>{f.expiresAt ? formatDate(f.expiresAt) : '∞'}</td>
                    <td>
                      <div className="table-actions">
                        <a
                          className="icon-btn"
                          href={`/download/${f.id}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Открыть страницу скачивания"
                        >
                          <LinkIcon size={15} />
                        </a>
                        <button
                          type="button"
                          className="icon-btn icon-btn-danger"
                          onClick={() => handleDelete(f.id)}
                          disabled={busyId === f.id}
                          title="Удалить"
                        >
                          <TrashIcon size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
