import { useState } from 'react';

interface ComposerProps {
  isSending: boolean;
  onSend: (question: string) => Promise<void>;
}

export function Composer({ isSending, onSend }: ComposerProps) {
  const [value, setValue] = useState('');

  const submit = async () => {
    if (!value.trim() || isSending) return;
    const payload = value;
    setValue('');
    await onSend(payload);
  };

  return (
    <div className="composer">
      <textarea
        placeholder="输入你的问题..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={async (event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            await submit();
          }
        }}
      />
      <button onClick={submit} disabled={!value.trim() || isSending}>
        发送
      </button>
    </div>
  );
}
