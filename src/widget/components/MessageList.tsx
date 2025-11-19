import type { FC } from 'react';
import { useEffect, useRef } from 'react';

export type MessageAuthor = 'user' | 'assistant';

export interface Message {
  id: string;
  author: MessageAuthor;
  text: string;
  timestamp: string;
}

interface MessageListProps {
  messages: Message[];
}

const formatter = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit'
});

const MessageList: FC<MessageListProps> = ({ messages }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (node) {
      node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div ref={containerRef} className="rumor-widget__messages" role="log" aria-live="polite">
      {messages.map((message) => (
        <article key={message.id} className={`rumor-message rumor-message--${message.author}`}>
          <p>{message.text}</p>
          <time dateTime={message.timestamp}>{formatter.format(new Date(message.timestamp))}</time>
        </article>
      ))}
    </div>
  );
};

export default MessageList;
