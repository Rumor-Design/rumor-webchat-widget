import type { ChangeEventHandler, FC, FormEventHandler } from 'react';

interface MessageComposerProps {
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: (message: string) => Promise<void> | void;
  disabled?: boolean;
}

const MessageComposer: FC<MessageComposerProps> = ({ draft, onDraftChange, onSend, disabled }) => {
  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    onDraftChange(event.target.value);
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!draft.trim()) {
      return;
    }
    await onSend(draft.trim());
  };

  return (
    <form className="rumor-widget__composer" onSubmit={handleSubmit}>
      <textarea
        className="rumor-widget__input"
        placeholder="Type a message..."
        value={draft}
        onChange={handleChange}
        rows={2}
        aria-label="Message"
        disabled={disabled}
      />
      <button type="submit" className="rumor-widget__send" disabled={disabled || !draft.trim()}>
        Send
      </button>
    </form>
  );
};

export default MessageComposer;
