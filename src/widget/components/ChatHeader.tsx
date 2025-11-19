import type { FC } from 'react';

interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  onDismiss: () => void;
}

const ChatHeader: FC<ChatHeaderProps> = ({ title, subtitle, onDismiss }) => (
  <header className="rumor-widget__header">
    <div>
      <p className="rumor-widget__title">{title}</p>
      {subtitle && <p className="rumor-widget__subtitle">{subtitle}</p>}
    </div>
    <button
      type="button"
      className="rumor-widget__icon-button"
      aria-label="Close chat panel"
      onClick={onDismiss}
    >
      <span aria-hidden="true">×</span>
    </button>
  </header>
);

export default ChatHeader;
