import { Component } from 'react';
import UploadPage from './components/UploadPage';
import DownloadPage from './components/DownloadPage';
import AdminPage from './components/AdminPage';
import { LogoMark, ShieldIcon, AlertIcon } from './components/icons';

class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="card center-card" style={{ margin: '60px auto 0', maxWidth: 460 }}>
          <span className="state-icon si-red"><AlertIcon size={26} /></span>
          <h2>Что-то сломалось</h2>
          <p className="dim">{String(this.state.error?.message || this.state.error)}</p>
          <a className="btn btn-ghost" href="/">На главную</a>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const path = window.location.pathname;
  const downloadMatch = path.match(/^\/download\/([A-Za-z0-9-]+)\/?$/);

  let page = <UploadPage />;
  if (downloadMatch) page = <DownloadPage id={downloadMatch[1]} />;
  else if (/^\/admin\/?$/.test(path)) page = <AdminPage />;

  return (
    <ErrorBoundary>
      <div className="app">
      <div className="bg" aria-hidden="true">
        <i /><i /><i />
      </div>

      <header className="nav">
        <div className="nav-inner">
          <a className="nav-logo" href="/">
            <LogoMark size={30} />
            <span className="logo-word">Easy<b>Files</b></span>
          </a>
          <nav className="nav-links">
            <a className="nav-link" href="/admin">
              <ShieldIcon size={17} />
              <span>Админ</span>
            </a>
          </nav>
        </div>
      </header>

      <main className={`main ${downloadMatch || /^\/admin\/?$/.test(path) ? 'main-wide' : ''}`}>{page}</main>

      <footer className="footer">
        <p>
          EasyFiles v2.0 — self-hosted обмен файлами ·{' '}
          <a href="https://github.com/brick-i/-easy-files" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </p>
      </footer>
      </div>
    </ErrorBoundary>
  );
}
