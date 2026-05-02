import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

export const FeedbackForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

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
      
      setSubmitted(true);
      setMessage('');
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Error!', error);
      alert('送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 画面右下のフローティングボタン */}
      <button 
        className="feedback-toggle-btn"
        onClick={() => setIsOpen(true)}
        aria-label="フィードバックを送る"
      >
        <MessageSquare size={24} />
      </button>

      {/* フィードバックモーダル */}
      {isOpen && (
        <div className="feedback-modal-overlay">
          <div className="feedback-modal">
            <div className="feedback-header">
              <h3>Feedback</h3>
              <button onClick={() => setIsOpen(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>
            
            {submitted ? (
              <div className="feedback-success">
                <p>ご意見ありがとうございました！</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="feedback-form">
                <p className="feedback-desc">
                  マップの不具合やご意見をお聞かせください。（Googleスプレッドシートへ送信されます）
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="例: 西1ホールの105番の場所が違います"
                  rows={4}
                  required
                />
                <button type="submit" disabled={isSubmitting || !message.trim()} className="submit-btn">
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
      )}
    </>
  );
};
