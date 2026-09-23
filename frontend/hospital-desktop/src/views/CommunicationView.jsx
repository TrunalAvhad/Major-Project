import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import communicationService from '../services/communicationService';
import PrivacyNotice from '../components/common/PrivacyNotice';
import { 
  MessageSquare, 
  Bell, 
  Send, 
  ShieldCheck, 
  User, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';

const CommunicationView = () => {
  const { notifications, messages, setMessages } = useApp();
  const [inputText, setInputText] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('notifications');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const newMsg = await communicationService.sendMessage(inputText);
      setMessages([...messages, newMsg]);
      setInputText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div style={{ padding: '20px', overflowY: 'auto', height: '100%' }}>
      {/* Privacy Notice */}
      <PrivacyNotice />

      {/* Header */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} color="var(--accent-teal)" />
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Module 18: Consortium Communications & Notifications
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Secure encrypted communications between this hospital node and consortium researchers.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setActiveSubTab('notifications')}
              className={activeSubTab === 'notifications' ? 'btn btn-teal' : 'btn btn-secondary'}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <Bell size={13} /> Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setActiveSubTab('messages')}
              className={activeSubTab === 'messages' ? 'btn btn-teal' : 'btn btn-secondary'}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <MessageSquare size={13} /> Operator Dispatch
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Tab */}
      {activeSubTab === 'notifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((n) => (
            <div key={n.id} className="card" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`pulse-dot ${n.read ? 'healthy' : 'warning'}`} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {n.title}
                  </span>
                  <span className="badge badge-teal font-mono" style={{ fontSize: '9px' }}>
                    {n.type}
                  </span>
                </div>
                <span className="font-mono text-muted" style={{ fontSize: '11px' }}>
                  {n.timestamp}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '6px' }}>
                {n.content}
              </p>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Origin: <strong>{n.sender}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Messages Tab */}
      {activeSubTab === 'messages' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '520px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', marginBottom: '12px' }}>
            Consortium Lead Researcher Secure Channel
          </div>

          {/* Message List */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '6px' }}>
            {messages.map((m) => {
              const isMe = m.sender_role === 'hospital_operator';
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: isMe ? '#0891b2' : '#17223b',
                    color: '#ffffff',
                    border: isMe ? 'none' : '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ fontSize: '10px', opacity: 0.8, marginBottom: '2px' }}>
                    {m.sender} • {m.timestamp}
                  </div>
                  <div style={{ fontSize: '12px', lineHeight: 1.4 }}>
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type encrypted message to consortium lead..."
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: '#090d16',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                outline: 'none'
              }}
            />
            <button type="submit" className="btn btn-teal">
              <Send size={14} /> Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CommunicationView;
