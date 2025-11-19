import type { CSSProperties, FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { WidgetProps } from '../types';
import ChatHeader from './components/ChatHeader';
import MessageList, { type Message } from './components/MessageList';
import MessageComposer from './components/MessageComposer';

const DEFAULT_TITLE = 'Rumor Assistant';
const DEFAULT_SUBTITLE = 'Typically replies in under 2 minutes';
const DEFAULT_ACCENT = '#2563eb';

const createId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const createAssistantMessage = (text: string): Message => ({
  id: createId(),
  author: 'assistant',
  text,
  timestamp: new Date().toISOString()
});

const createUserMessage = (text: string): Message => ({
  id: createId(),
  author: 'user',
  text,
  timestamp: new Date().toISOString()
});

const App: FC<WidgetProps> = ({
  apiUrl,
  title = DEFAULT_TITLE,
  accentColor = DEFAULT_ACCENT,
  initialOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [
    createAssistantMessage('Hi! Ask me anything about your Rumor workspace.')
  ]);

  useEffect(() => {
    setIsOpen(initialOpen);
  }, [initialOpen]);

  const subtitle = useMemo(() => {
    if (!apiUrl) {
      return DEFAULT_SUBTITLE;
    }
    try {
      const url = new URL(apiUrl);
      return `Connected to ${url.host}`;
    } catch (error) {
      return DEFAULT_SUBTITLE;
    }
  }, [apiUrl]);

  const cssVars = useMemo(
    () => ({
      '--rumor-accent': accentColor
    }) as CSSProperties,
    [accentColor]
  );

  const togglePanel = () => setIsOpen((open) => !open);

  const handleSend = async (content: string) => {
    if (!content) {
      return;
    }

    const userMessage = createUserMessage(content);
    setMessages((prev) => [...prev, userMessage]);
    setDraft('');

    setIsSending(true);
    // Placeholder for actual network request.
    const simulatedResponse = await mockResponse(content, apiUrl);
    setMessages((prev) => [...prev, simulatedResponse]);
    setIsSending(false);
  };

  return (
    <div className="rumor-widget" data-open={isOpen} style={cssVars}>
      <button
        type="button"
        className="rumor-widget__launcher"
        aria-label={isOpen ? 'Minimize chat' : 'Open chat'}
        aria-expanded={isOpen}
        onClick={togglePanel}
      >
        <span aria-hidden="true">💬</span>
      </button>

      <section className="rumor-widget__panel" aria-hidden={!isOpen} data-open={isOpen}>
        <ChatHeader title={title} subtitle={subtitle} onDismiss={togglePanel} />
        <MessageList messages={messages} />
        <MessageComposer draft={draft} onDraftChange={setDraft} onSend={handleSend} disabled={isSending} />
      </section>
    </div>
  );
};

async function mockResponse(content: string, apiUrl?: string): Promise<Message> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const suffix = apiUrl ? ` (pending live API at ${apiUrl})` : '';
  return createAssistantMessage(`You said: "${content}"${suffix}`);
}

export default App;
