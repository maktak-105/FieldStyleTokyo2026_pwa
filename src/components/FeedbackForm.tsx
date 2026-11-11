import React, { useEffect, useState } from 'react';
import { X, Send } from 'lucide-react';

const MAX_MESSAGE_LENGTH = 500;
const COOLDOWN_MS = 60 * 1000;
const COOLDOWN_STORAGE_KEY = 'fs2026_feedback_last_sent';

type Availability = 'loading' | 'ready' | 'unconfigured';

export const FeedbackForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot: 人間には非表示、botのみ入力する
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState<Availability>('loading');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/feedback', { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          setAvailability('unconfigured');
          return;
        }
        const data = await res.json() as { enabled?: boolean };
        setAvailability(data.enabled ? 'ready' : 'unconfigured');
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setAvailability('unconfigured');
      });
    return () => controller.abort();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (availability !== 'ready') return;

    const trimmed = message.trim();
    if (!trimmed) return;

    // ハニーポット欄に値が入っていればbotとみなし、成功したふりをして送らない
    if (website.trim()) {
      setSubmitted(true);
      setMessage('');
      setTimeout(onClose, 2000);
      return;
    }

    const lastSent = Number(localStorage.getItem(COOLDOWN_STORAGE_KEY) || '0');
    if (Date.now() - lastSent < COOLDOWN_MS) {
      setError('連続送信はできません。少し時間をおいてお試しください。');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: trimmed, website }),
      });
      const data = await res.json().catch(() => null) as { ok?: boolean; error?: string } | null;

      if (res.status === 503 || data?.error === 'unconfigured') {
        setAvailability('unconfigured');
        return;
      }
      if (!res.ok || data?.ok !== true) {
        setError(res.status === 400 ? '送信内容を確認してください。' : '送信に失敗しました');
        return;
      }

      localStorage.setItem(COOLDOWN_STORAGE_KEY, String(Date.now()));
      setSubmitted(true);
      setMessage('');
      setTimeout(onClose, 2000);
    } catch {
      setError('送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputDisabled = availability !== 'ready' || isSubmitting;
  const description = availability === 'loading'
    ? '送信先を確認しています。'
    : availability === 'unconfigured'
      ? '送信先が未設定です。'
      : 'マップの不具合やご意見をお聞かせください。';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="help-modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
          <h2 style={{ margin: 0, border: 'none', padding: 0, fontSize: '20px', color: '#1e293b' }}>フィードバック</h2>
          <button
            onClick={onClose}
            className="close-btn"
            aria-label="閉じる"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}
          >
            <X size={22} />
          </button>
        </div>

        {submitted ? (
          <p className="feedback-success">ご意見ありがとうございました！</p>
        ) : (
          <form onSubmit={handleSubmit} className="feedback-form">
            <p className="feedback-desc">{description}</p>
            <input
              type="text"
              name="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
            />
            <textarea
              className="feedback-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
              placeholder="例: 西1ホールの105番の場所が違います"
              rows={4}
              maxLength={MAX_MESSAGE_LENGTH}
              required
              disabled={inputDisabled}
            />
            <p className="feedback-charcount">{message.length} / {MAX_MESSAGE_LENGTH}</p>
            {error && <p className="feedback-error">{error}</p>}
            <button type="submit" disabled={inputDisabled || !message.trim()} className="help-close feedback-submit-btn">
              {isSubmitting ? '送信中...' : (
                <>
                  <Send size={16} />
                  送信
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
