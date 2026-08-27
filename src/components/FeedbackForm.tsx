import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

const MAX_MESSAGE_LENGTH = 500;
const COOLDOWN_MS = 60 * 1000;
const COOLDOWN_STORAGE_KEY = 'fs2026_feedback_last_sent';

export const FeedbackForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot: 人間には非表示、botのみ入力する
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cooldownError, setCooldownError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // ハニーポット欄に値が入っていればbotとみなし、成功したふりをして無視する
    if (website.trim()) {
      setSubmitted(true);
      setMessage('');
      setTimeout(onClose, 2000);
      return;
    }

    const lastSent = Number(localStorage.getItem(COOLDOWN_STORAGE_KEY) || '0');
    if (Date.now() - lastSent < COOLDOWN_MS) {
      setCooldownError(true);
      return;
    }
    setCooldownError(false);

    setIsSubmitting(true);

    // NOTE:
    // ここに Google Apps Script (GAS) の Webアプリ URL または
    // Google Forms の action URL を指定します。
    // 例: const scriptURL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
    const scriptURL = import.meta.env.VITE_FEEDBACK_URL || '';

    try {
      if (scriptURL) {
        // GAS等へPOSTする場合の一般的な実装
        const formData = new FormData();
        formData.append('message', message);
        formData.append('timestamp', new Date().toISOString());

        await fetch(scriptURL, { method: 'POST', body: formData });
      } else {
        // URL未設定時のダミーディレイ
        await new Promise(resolve => setTimeout(resolve, 800));
        console.log('Feedback message (dev):', message);
      }

      localStorage.setItem(COOLDOWN_STORAGE_KEY, String(Date.now()));
      setSubmitted(true);
      setMessage('');
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error('Error!', error);
      alert('送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <p className="feedback-desc">
              マップの不具合やご意見をお聞かせください。（Googleスプレッドシートへ送信されます）
            </p>
            {/* ハニーポット: 人間には見えない欄。botが入力すると送信を無視する */}
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
            />
            <p className="feedback-charcount">{message.length} / {MAX_MESSAGE_LENGTH}</p>
            {cooldownError && (
              <p className="feedback-error">連続送信はできません。少し時間をおいてお試しください。</p>
            )}
            <button type="submit" disabled={isSubmitting || !message.trim()} className="help-close feedback-submit-btn">
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
