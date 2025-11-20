import type { CSSProperties, FC } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { WidgetProps } from '../types';
import ChatHeader from './components/ChatHeader';
import MessageList, { type Message } from './components/MessageList';
import MessageComposer from './components/MessageComposer';

const DEFAULT_TITLE = 'Rumor Assistant';
const DEFAULT_SUBTITLE = 'Typically replies in under 2 minutes';
const DEFAULT_ACCENT = '#2563eb';
const DEFAULT_API_ENDPOINT = 'http://127.0.0.1:8000/api/chat';

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
  const sessionIdRef = useRef<string>();

  if (!sessionIdRef.current) {
    sessionIdRef.current = createId();
  }

  const chatEndpoint = useMemo(() => {
    if (!apiUrl) {
      return DEFAULT_API_ENDPOINT;
    }
    try {
      return new URL(apiUrl).toString();
    } catch (error) {
      console.warn('Invalid apiUrl provided to Rumor widget; falling back to default endpoint.', error);
      return DEFAULT_API_ENDPOINT;
    }
  }, [apiUrl]);

  useEffect(() => {
    setIsOpen(initialOpen);
  }, [initialOpen]);

  const subtitle = useMemo(() => {
    try {
      const url = new URL(chatEndpoint);
      return `Connected to ${url.host}`;
    } catch (error) {
      return DEFAULT_SUBTITLE;
    }
  }, [chatEndpoint]);

  const cssVars = useMemo(
    () => ({
      '--rumor-accent': accentColor
    }) as CSSProperties,
    [accentColor]
  );

  const togglePanel = () => setIsOpen((open) => !open);

  const handleSend = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    const userMessage = createUserMessage(trimmed);
    setMessages((prev) => [...prev, userMessage]);
    setDraft('');

    setIsSending(true);
    try {
      const reply = await requestAssistantMessage({
        endpoint: chatEndpoint,
        sessionId: sessionIdRef.current,
        userMessage,
        history: [...messages, userMessage]
      });
      setMessages((prev) => [...prev, reply]);
    } catch (error) {
      console.error('Rumor widget failed to reach the chat API.', error);
      setMessages((prev) => [
        ...prev,
        createAssistantMessage('Sorry, something went wrong. Please try again in a moment.')
      ]);
    } finally {
      setIsSending(false);
    }
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

interface RequestAssistantMessageArgs {
  endpoint: string;
  sessionId: string;
  userMessage: Message;
  history: Message[];
}

interface ChatApiResponse {
  session_id: string;
  messages: Array<{
    role: 'assistant' | 'user';
    content: string;
  }>;
  lead_captured: boolean;
  meeting_scheduled: boolean;
  suggested_slots: null | unknown;
}

async function requestAssistantMessage({
  endpoint,
  sessionId,
  userMessage,
  history
}: RequestAssistantMessageArgs): Promise<Message> {
  const payload = {
    session_id: sessionId,
    message: {
      role: 'user',
      content: userMessage.text,
      timestamp: userMessage.timestamp
    },
    history: history.map(({ author, text, timestamp }) => ({
      role: author,
      content: text,
      timestamp
    })),
    metadata: {}
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Chat API responded with ${response.status}`);
  }

  const data: ChatApiResponse = await response.json();
  const assistantMessage = data.messages.find((message) => message.role === 'assistant');

  if (!assistantMessage) {
    throw new Error('Chat API response missing assistant message.');
  }

  return createAssistantMessage(assistantMessage.content);
}

export default App;
