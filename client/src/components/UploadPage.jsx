import { useState } from 'react';
import UploadForm from './UploadForm';
import SuccessCard from './SuccessCard';
import { ZapIcon, LockIcon, ClockIcon } from './icons';

export default function UploadPage() {
  const [uploaded, setUploaded] = useState(null);

  return (
    <div className="page">
      <section className="hero">
        <span className="hero-badge">
          <i className="dot" />
          Обмен файлами без регистрации
        </span>
        <h1>
          Делись файлами <span className="grad-text">за секунды</span>
        </h1>
        <p className="hero-sub">
          Перетащите файл, получите ссылку и отправьте её кому угодно — по интернету или в локальной сети.
          Файлы хранятся на вашем сервере и удаляются по таймеру.
        </p>
      </section>

      {uploaded ? (
        <SuccessCard file={uploaded} onReset={() => setUploaded(null)} />
      ) : (
        <UploadForm onSuccess={setUploaded} />
      )}

      <section className="features">
        <div className="feature">
          <span className="feature-icon fi-violet"><ZapIcon size={19} /></span>
          <div>
            <b>До 2 ГБ</b>
            <span>любые типы файлов</span>
          </div>
        </div>
        <div className="feature">
          <span className="feature-icon fi-cyan"><LockIcon size={19} /></span>
          <div>
            <b>Пароль и лимит</b>
            <span>контроль доступа к файлу</span>
          </div>
        </div>
        <div className="feature">
          <span className="feature-icon fi-pink"><ClockIcon size={19} /></span>
          <div>
            <b>Самоуничтожение</b>
            <span>автоудаление по таймеру</span>
          </div>
        </div>
      </section>
    </div>
  );
}
