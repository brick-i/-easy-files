import { fileCategory } from '../lib/format';

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function Svg({ size = 20, children, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...rest}>
      {children}
    </svg>
  );
}

export const LogoMark = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <defs>
      <linearGradient id="ef-logo-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#7c5cff" />
        <stop offset="1" stopColor="#22d3ee" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="15" fill="url(#ef-logo-g)" />
    <path d="M32 45V23m0 0l-10 10m10-10l10 10" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M20 49h24" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" opacity=".8" />
  </svg>
);

export const UploadIcon = (p) => (
  <Svg {...p}>
    <path d="M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5" />
    <path d="M4 15v3a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-3" />
  </Svg>
);

export const DownloadIcon = (p) => (
  <Svg {...p}>
    <path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5" />
    <path d="M4 17v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1" />
  </Svg>
);

export const FileIcon = (p) => (
  <Svg {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </Svg>
);

export const FileTextIcon = (p) => (
  <Svg {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6M9 17h4" />
  </Svg>
);

export const ImageIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <circle cx="8.5" cy="10" r="1.6" />
    <path d="M21 15.5l-4.5-4.5L6 21.5" />
  </Svg>
);

export const VideoIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="6" width="13" height="12" rx="2.5" />
    <path d="M16 10.5l5-2.5v8l-5-2.5" />
  </Svg>
);

export const MusicIcon = (p) => (
  <Svg {...p}>
    <path d="M9 18V6l11-2v12" />
    <circle cx="6.5" cy="18" r="2.5" />
    <circle cx="17.5" cy="16" r="2.5" />
  </Svg>
);

export const ArchiveIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="4.5" rx="1" />
    <path d="M5 8.5V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5" />
    <path d="M10 12.5h4" />
  </Svg>
);

export const CodeIcon = (p) => (
  <Svg {...p}>
    <path d="M8.5 8L4.5 12l4 4" />
    <path d="M15.5 8l4 4-4 4" />
  </Svg>
);

export const CopyIcon = (p) => (
  <Svg {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2.5" />
    <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" />
  </Svg>
);

export const CheckIcon = (p) => (
  <Svg {...p}>
    <path d="M4.5 12.5l5 5L19.5 7" />
  </Svg>
);

export const LinkIcon = (p) => (
  <Svg {...p}>
    <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3.1-3.1a4.5 4.5 0 1 0-6.4-6.4L11.6 6" />
    <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3.1 3.1a4.5 4.5 0 1 0 6.4 6.4l1.5-1.5" />
  </Svg>
);

export const LockIcon = (p) => (
  <Svg {...p}>
    <rect x="4.5" y="11" width="15" height="9.5" rx="2.5" />
    <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
  </Svg>
);

export const ClockIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);

export const TrashIcon = (p) => (
  <Svg {...p}>
    <path d="M4 7h16" />
    <path d="M9.5 7V5.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5V7" />
    <path d="M6.5 7l.8 12a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.8-12" />
    <path d="M10 11v6M14 11v6" />
  </Svg>
);

export const XIcon = (p) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const ShieldIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3l7.5 3v5.5c0 4.6-3.1 7.7-7.5 9.5-4.4-1.8-7.5-4.9-7.5-9.5V6z" />
    <path d="M9 12l2 2 4-4.5" />
  </Svg>
);

export const KeyIcon = (p) => (
  <Svg {...p}>
    <circle cx="8" cy="16" r="4" />
    <path d="M10.8 13.2L20 4m-4 1l3 3" />
  </Svg>
);

export const QrIcon = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1" />
    <rect x="14" y="3.5" width="6.5" height="6.5" rx="1" />
    <rect x="3.5" y="14" width="6.5" height="6.5" rx="1" />
    <path d="M14 14h3v3h-3zM20.5 14v.01M14 20.5v.01M17.5 20.5h3v-3" />
  </Svg>
);

export const ZapIcon = (p) => (
  <Svg {...p}>
    <path d="M13 2.5L4.5 13.5H11L10 21.5l8.5-11H12z" />
  </Svg>
);

export const EyeIcon = (p) => (
  <Svg {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const EyeOffIcon = (p) => (
  <Svg {...p}>
    <path d="M4 4l16 16" />
    <path d="M9.9 5.9A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.6 17.6 0 0 1-3 3.7M6.1 6.9A16.6 16.6 0 0 0 2.5 12S6 18.5 12 18.5a9.4 9.4 0 0 0 4.3-1" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </Svg>
);

export const RefreshIcon = (p) => (
  <Svg {...p}>
    <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6l2.5 2.4" />
    <path d="M20.5 3.5v5h-5" />
  </Svg>
);

export const DatabaseIcon = (p) => (
  <Svg {...p}>
    <ellipse cx="12" cy="5.5" rx="8" ry="3" />
    <path d="M4 5.5V18.5c0 1.7 3.6 3 8 3s8-1.3 8-3V5.5" />
    <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
  </Svg>
);

export const AlertIcon = (p) => (
  <Svg {...p}>
    <path d="M10.3 4.2L2.9 17a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0z" />
    <path d="M12 9.5V14" />
    <path d="M12 17v.01" />
  </Svg>
);

const CATEGORY = {
  image: { Icon: ImageIcon, color: '#f472b6', label: 'Изображение' },
  video: { Icon: VideoIcon, color: '#a78bfa', label: 'Видео' },
  audio: { Icon: MusicIcon, color: '#fb923c', label: 'Аудио' },
  archive: { Icon: ArchiveIcon, color: '#fbbf24', label: 'Архив' },
  document: { Icon: FileTextIcon, color: '#60a5fa', label: 'Документ' },
  code: { Icon: CodeIcon, color: '#22d3ee', label: 'Код' },
  file: { Icon: FileIcon, color: '#94a3b8', label: 'Файл' },
};

export function FileTypeBadge({ name, size = 44 }) {
  const { Icon, color } = CATEGORY[fileCategory(name)];
  return (
    <span className="file-badge" style={{ '--badge-c': color, width: size, height: size }}>
      <Icon size={Math.round(size * 0.5)} />
    </span>
  );
}

export const categoryLabel = (name) => CATEGORY[fileCategory(name)].label;
